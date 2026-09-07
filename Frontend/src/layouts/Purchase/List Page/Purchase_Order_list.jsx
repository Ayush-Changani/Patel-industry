import React, { useState, useEffect } from "react";
import api from "../../../services/axios";
import Swal from "sweetalert2";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../../context/AuthContext";
import Sidebar from "../../../components/Sidebar";
import Header from "../../../components/Header";
import Grid from "../../../assets/Grid/Grid";

const Purchase_Order_list = () => {
  const navigate = useNavigate();
  const { user } = useAuth();

  const [allData, setAllData] = useState([]);
  const [filteredData, setFilteredData] = useState([]);
  const [data, setData] = useState([]);

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

  /* ================= LOAD ================= */
  const loadPOs = async () => {
    try {
      const res = await api.get("/i_pi_purchase_order_select_all_and_id", {
        params: { po_id: 0 },
      });

      const apiData = Array.isArray(res.data.Result) ? res.data.Result : [];

      setAllData(apiData);
      computeStats(apiData);

      applyFilters(apiData, searchText, statusFilter, dateFrom, dateTo, 1);

    } catch {
      Swal.fire("Error", "Failed to fetch purchase orders", "error");
      setAllData([]);
      setFilteredData([]);
      setData([]);
    }
  };

  /* ================= STATS ================= */
  const computeStats = (list) => {
    setStats({
      total: list.length,
      draft: list.filter((r) => (r.po_status || r.status)?.toLowerCase() === "draft").length,
      pending: list.filter((r) => (r.po_status || r.status)?.toLowerCase() === "pending").length,
      approved: list.filter((r) => (r.po_status || r.status)?.toLowerCase() === "approved").length,
      rejected: list.filter((r) => (r.po_status || r.status)?.toLowerCase() === "rejected").length,
    });
  };

  /* ================= FILTER ================= */
  const applyFilters = (source, search, status, from, to, page) => {

    let filtered = source.filter((row) => {
      const matchSearch =
        !search ||
        row.po_number?.toLowerCase().includes(search.toLowerCase()) ||
        row.vendor_name?.toLowerCase().includes(search.toLowerCase());

      const matchStatus =
        status === "All status" ||
        (row.po_status || row.status)?.toLowerCase() === status.toLowerCase();

      const matchFrom =
        !from || new Date(row.po_date) >= new Date(from);

      const matchTo =
        !to || new Date(row.po_date) <= new Date(to);

      return matchSearch && matchStatus && matchFrom && matchTo;
    });

    setFilteredData(filtered);
    setTotalRecords(filtered.length);

    const start = (page - 1) * pageSize;
    setData(filtered.slice(start, start + pageSize));
    setCurrentPage(page);
  };

  useEffect(() => {
    loadPOs();
  }, []);

  /* ================= HANDLERS ================= */

  const handleSearch = (text) => {
    setSearchText(text);
    applyFilters(allData, text, statusFilter, dateFrom, dateTo, 1);
  };

  const handlePageChange = (page) => {
    const start = (page - 1) * pageSize;
    setData(filteredData.slice(start, start + pageSize));
    setCurrentPage(page);
  };

  const handleClear = () => {
    setSearchText("");
    setStatusFilter("All status");
    setDateFrom("");
    setDateTo("");
    setActiveStatFilter("");

    applyFilters(allData, "", "All status", "", "", 1);
  };

  const handleStatClick = (label) => {
    if (activeStatFilter === label) {
      setActiveStatFilter("");
      setStatusFilter("All status");
      applyFilters(allData, searchText, "All status", dateFrom, dateTo, 1);
    } else {
      setActiveStatFilter(label);
      const newStatus = label === "Total" ? "All status" : label;
      setStatusFilter(newStatus);
      applyFilters(allData, searchText, newStatus, dateFrom, dateTo, 1);
    }
  };

  /* ================= NAVIGATION ================= */
  const handleAdd = () => navigate("/Purchase_Order_form");
  const handleEdit = (row) => navigate(`/Purchase_Order_form?eid=${row.id}`);
  const handleView = (row) => navigate(`/Purchase_Order_form?view_id=${row.id}`);

  /* ================= APPROVE ================= */
  const handleApprove = async (row) => {
    const result = await Swal.fire({
      title: "Approve Purchase Order?",
      text: `Approve PO ${row.po_number}?`,
      icon: "question",
      showCancelButton: true,
      confirmButtonColor: "#16a34a",
      confirmButtonText: "Yes, approve!",
    });

    if (result.isConfirmed) {
      try {
        const res = await api.post("/i_pi_purchase_order_approval_action", {
          po_id: row.id,
          action: "Approved",
          approved_by_user_id: user?.id,
          po_rejection_remarks: "",
        });

        if (res.data?.Status === 1 || res.data?.status === 1) {
          Swal.fire("Approved", "PO approved successfully", "success");
          loadPOs();
        } else {
          Swal.fire("Error", res.data?.message || "Approval failed", "error");
        }

      } catch {
        Swal.fire("Error", "Server error", "error");
      }
    }
  };

  /* ================= REJECT ================= */
  const handleReject = async (row) => {
    const { value: reason, isConfirmed } = await Swal.fire({
      title: "Reject Purchase Order",
      input: "textarea",
      inputPlaceholder: "Enter reason...",
      showCancelButton: true,
      confirmButtonColor: "#dc2626",
      confirmButtonText: "Reject",
      inputValidator: (v) => (!v ? "Reason required" : undefined),
    });

    if (isConfirmed && reason) {
      try {
        const res = await api.post("/i_pi_purchase_order_approval_action", {
          po_id: row.id,
          action: "Rejected",
          approved_by_user_id: user?.id,
          po_rejection_remarks: reason,
        });

        if (res.data?.Status === 1 || res.data?.status === 1) {
          Swal.fire("Rejected", "PO rejected successfully", "success");
          loadPOs();
        } else {
          Swal.fire("Error", res.data?.message || "Reject failed", "error");
        }

      } catch {
        Swal.fire("Error", "Server error", "error");
      }
    }
  };

  /* ================= DELETE ================= */
  const handleDelete = async (row) => {
    const result = await Swal.fire({
      title: "Are you sure?",
      text: `Delete PO ${row.po_number}?`,
      icon: "warning",
      showCancelButton: true,
    });

    if (result.isConfirmed) {
      try {
        const res = await api.post(`/i_pi_purchase_order_delete?id=${row.id}`);

        if (res.data?.status === 1 || res.data?.Status === 1) {
          Swal.fire("Deleted!", "PO deleted.", "success");
          loadPOs();
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
              title="Purchase Order Records"
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
              onReload={loadPOs}

              onEdit={handleEdit}
              onView={handleView}
              onDelete={handleDelete}

              onPageChange={handlePageChange} 
              showApprove={true}
              onApprove={handleApprove}
              onReject={handleReject} 
              ignoreColumns={["id"]}
            />

          </div>
        </div>
      </main>
    </div>
  );
};

export default Purchase_Order_list;