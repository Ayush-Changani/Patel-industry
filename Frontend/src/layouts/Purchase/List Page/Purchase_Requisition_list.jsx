import React, { useState, useEffect } from "react";
import api from "../../../services/axios";
import Swal from "sweetalert2";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../../context/AuthContext";
import Sidebar from "../../../components/Sidebar";
import Header from "../../../components/Header";
import Grid from "../../../assets/Grid/Grid";

const Purchase_Requisition_list = () => {
  const navigate = useNavigate();
  const { user } = useAuth();

  const [data, setData] = useState([]);
  const [allData, setAllData] = useState([]);
  const [filteredData, setFilteredData] = useState([]);

  const [totalRecords, setTotalRecords] = useState(0);
  const [currentPage, setCurrentPage] = useState(1);

  const [stats, setStats] = useState({
    total: 0,
    draft: 0,
    pending: 0,
    approved: 0,
    rejected: 0,
  });

  const pageSize = 10;

  const [searchText, setSearchText] = useState("");
  const [statusFilter, setStatusFilter] = useState("All status");
  const [dateFrom, setDateFrom] = useState("");
  const [dateTo, setDateTo] = useState("");
  const [activeStatFilter, setActiveStatFilter] = useState("");

  /* LOAD */
  const loadPRs = async () => {
    try {
      const res = await api.get("/i_pi_purchase_requisition_select_all_and_id", {
        params: { pr_id: 0 },
      });

      const apiData = Array.isArray(res.data.Result) ? res.data.Result : [];

      setAllData(apiData);
      computeStats(apiData);

      setFilteredData(apiData);
      setTotalRecords(apiData.length);
      setData(apiData.slice(0, pageSize));
      setCurrentPage(1);

    } catch {
      Swal.fire("Error", "Failed to fetch purchase requisitions", "error");
      setAllData([]);
      setFilteredData([]);
      setData([]);
    }
  };

  const computeStats = (list) => {
    setStats({
      total: list.length,
      draft: list.filter(r => r.status?.toLowerCase() === "draft").length,
      pending: list.filter(r => r.status?.toLowerCase() === "pending").length,
      approved: list.filter(r => r.status?.toLowerCase() === "approved").length,
      rejected: list.filter(r => r.status?.toLowerCase() === "rejected").length,
    });
  };

  /* FILTER */
  const applyFilters = (search, status, from, to) => {
    let filtered = allData.filter((row) => {
      const matchSearch =
        !search ||
        row.pr_number?.toLowerCase().includes(search.toLowerCase());

      const matchStatus =
        status === "All status" ||
        row.status?.toLowerCase() === status.toLowerCase();

      const matchFrom =
        !from || new Date(row.pr_date) >= new Date(from);

      const matchTo =
        !to || new Date(row.pr_date) <= new Date(to);

      return matchSearch && matchStatus && matchFrom && matchTo;
    });

    setFilteredData(filtered);
    setTotalRecords(filtered.length);
    setCurrentPage(1);
    setData(filtered.slice(0, pageSize));
  };

  useEffect(() => {
    loadPRs();
  }, []);

  /* SEARCH */
  const handleSearch = (text) => {
    setSearchText(text);
    applyFilters(text, statusFilter, dateFrom, dateTo);
  };

  /* FILTER CHANGE */
  const handleFilterChange = (type, value) => {
    let s = searchText;
    let st = statusFilter;
    let df = dateFrom;
    let dt = dateTo;

    if (type === "status") {
      st = value;
      setStatusFilter(value);
    }
    if (type === "dateFrom") {
      df = value;
      setDateFrom(value);
    }
    if (type === "dateTo") {
      dt = value;
      setDateTo(value);
    }

    applyFilters(s, st, df, dt);
  };

  /* PAGINATION */
  const handlePageChange = (page) => {
    const start = (page - 1) * pageSize;
    setData(filteredData.slice(start, start + pageSize));
    setCurrentPage(page);
  };

  /* CLEAR */
  const handleClear = () => {
    setSearchText("");
    setStatusFilter("All status");
    setDateFrom("");
    setDateTo("");
    setActiveStatFilter("");

    setFilteredData(allData);
    setTotalRecords(allData.length);
    setCurrentPage(1);
    setData(allData.slice(0, pageSize));
  };

  /* STAT CLICK */
  const handleStatClick = (label) => {
    if (activeStatFilter === label) {
      setActiveStatFilter("");
      setStatusFilter("All status");
      applyFilters(searchText, "All status", dateFrom, dateTo);
    } else {
      setActiveStatFilter(label);
      const newStatus = label === "Total" ? "All status" : label;
      setStatusFilter(newStatus);
      applyFilters(searchText, newStatus, dateFrom, dateTo);
    }
  };

  /* NAVIGATION */
  const handleAdd = () => navigate("/Purchase_Requisition_form");
  const handleEdit = (row) => navigate(`/Purchase_Requisition_form?eid=${row.id}`);
  const handleView = (row) => navigate(`/Purchase_Requisition_form?view_id=${row.id}`);

  /* ✅ APPROVE */
  const handleApprove = async (row) => {
    const result = await Swal.fire({
      title: "Approve Requisition?",
      text: `Approve PR ${row.pr_number}?`,
      icon: "question",
      showCancelButton: true,
      confirmButtonColor: "#16a34a",
      confirmButtonText: "Yes, approve!",
    });

    if (result.isConfirmed) {
      try {
        const res = await api.post("/i_pi_purchase_requisition_approval_action", {
          pr_id: row.id,
          action: "Approved",
          approved_by_user_id: user?.id,
          pr_rejection_remarks: "",
        });

        if (res.data?.Status === 1 || res.data?.status === 1) {
          Swal.fire("Approved", "Requisition approved.", "success");
          loadPRs();
        } else {
          Swal.fire("Error", "Approval failed.", "error");
        }
      } catch {
        Swal.fire("Error", "Server error.", "error");
      }
    }
  };

  /* ❌ REJECT */
  const handleReject = async (row) => {
    const { value: reason, isConfirmed } = await Swal.fire({
      title: "Reject Requisition",
      input: "textarea",
      inputLabel: "Reason",
      showCancelButton: true,
      confirmButtonColor: "#dc2626",
      inputValidator: (v) => !v && "Enter reason",
    });

    if (isConfirmed && reason) {
      try {
        const res = await api.post("/i_pi_purchase_requisition_approval_action", {
          pr_id: row.id,
          action: "Rejected",
          approved_by_user_id: user?.id,
          pr_rejection_remarks: reason,
        });

        if (res.data?.Status === 1 || res.data?.status === 1) {
          Swal.fire("Rejected", "Requisition rejected.", "success");
          loadPRs();
        } else {
          Swal.fire("Error", "Rejection failed.", "error");
        }
      } catch {
        Swal.fire("Error", "Server error.", "error");
      }
    }
  };

  /* DELETE */
  const handleDelete = async (row) => {
    const result = await Swal.fire({
      title: "Are you sure?",
      text: `Delete requisition ${row.pr_number}?`,
      icon: "warning",
      showCancelButton: true,
    });

    if (result.isConfirmed) {
      try {
        const res = await api.post(`/i_pi_purchase_requisition_delete?id=${row.pr_id}`);

        if (res.data?.status === 1 || res.data?.Status === 1) {
          Swal.fire("Deleted!", "Requisition deleted.", "success");
          loadPRs();
        }
      } catch {
        Swal.fire("Error", "Delete failed", "error");
      }
    }
  };

  const statCards = [
    { label: "Total", value: stats.total, bg: "#f8fafc", color: "#334155", border: "#cbd5e1" },
    { label: "Draft", value: stats.draft, bg: "#f1f5f9", color: "#475569", border: "#cbd5e1" },
    { label: "Pending", value: stats.pending, bg: "#fef3c7", color: "#92400e", border: "#fcd34d" },
    { label: "Approved", value: stats.approved, bg: "#dcfce7", color: "#166534", border: "#86efac" },
    { label: "Rejected", value: stats.rejected, bg: "#fee2e2", color: "#991b1b", border: "#fca5a5" },
  ];

  return (
    <div className="flex min-h-screen">
      <Sidebar />
      <main className="flex-1 ml-64 min-h-screen bg-gray-50/50">
        <Header />

        <div className="p-8">
          <div className="max-w-[1200px] mx-auto space-y-8">

            <Grid
              title="Requisition Records"
              data={data}
              stats={statCards}
              onClearFilters={handleClear}
              onStatClick={handleStatClick}
              activeStatLabel={activeStatFilter}
              totalRecords={totalRecords}
              currentPage={currentPage}
              pageSize={pageSize}
              onSearch={handleSearch}
              onAdd={handleAdd}
              onReload={loadPRs}
              onEdit={handleEdit}
              onView={handleView}
              onDelete={handleDelete}
              onPageChange={handlePageChange}

              /* ✅ RESTORED */
              showApprove={true}
              onApprove={handleApprove}
              onReject={handleReject}

              ignoreColumns={[
                "id",
                "pr_priority",
                "pr_entity_id",
                "pr_entity_group_id",
                "pr_department_id",
                "pr_store_location_id",
                "pr_requested_by_user_id",
                "pr_approved_by_user_id",
                "pr_purpose_justification",
                "pr_remarks",
                "created_date",
                "modified_date"
              ]}
            />

          </div>
        </div>
      </main>
    </div>
  );
};

export default Purchase_Requisition_list;