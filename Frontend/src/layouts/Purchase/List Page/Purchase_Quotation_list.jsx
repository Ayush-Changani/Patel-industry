import React, { useState, useEffect } from "react";
import api from "../../../services/axios";
import Swal from "sweetalert2";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../../context/AuthContext";
import Sidebar from "../../../components/Sidebar";
import Header from "../../../components/Header";
import Grid from "../../../assets/Grid/Grid";

const Purchase_Quotation_list = () => {
  const navigate = useNavigate();
  const { user } = useAuth();

  /* ================= STATE ================= */
  const [allData, setAllData] = useState([]);
  const [filteredData, setFilteredData] = useState([]); // ✅ FIX
  const [data, setData] = useState([]);

  const [totalRecords, setTotalRecords] = useState(0);
  const [currentPage, setCurrentPage] = useState(1);

  const [stats, setStats] = useState({
    total: 0,
    draft: 0,
    pending: 0,
    approved: 0,
    rejected: 0,
    finalized: 0,
  });

  const pageSize = 10;

  const [searchText, setSearchText] = useState("");
  const [statusFilter, setStatusFilter] = useState("All status");
  const [dateFrom, setDateFrom] = useState("");
  const [dateTo, setDateTo] = useState("");
  const [activeStatFilter, setActiveStatFilter] = useState("");

  /* ================= LOAD ================= */
  const loadPQs = async () => {
    try {
      const res = await api.get("/i_pi_purchase_quotation_select_all_and_id", {
        params: { pq_id: 0 },
      });

      const apiData = Array.isArray(res.data.Result) ? res.data.Result : [];

      setAllData(apiData);
      computeStats(apiData);

      applyFilters(apiData, searchText, statusFilter, dateFrom, dateTo, 1);

    } catch {
      Swal.fire("Error", "Failed to fetch purchase quotations", "error");
      setAllData([]);
      setFilteredData([]);
      setData([]);
    }
  };

  /* ================= STATS ================= */
  const computeStats = (list) => {
    setStats({
      total: list.length,
      draft: list.filter((r) => (r.pq_status || r.status)?.toLowerCase() === "draft").length,
      pending: list.filter((r) => (r.pq_status || r.status)?.toLowerCase() === "pending").length,
      approved: list.filter((r) => (r.pq_status || r.status)?.toLowerCase() === "approved").length,
      rejected: list.filter((r) => (r.pq_status || r.status)?.toLowerCase() === "rejected").length,
      finalized: list.filter((r) => (r.pq_status || r.status)?.toLowerCase() === "finalized").length,
    });
  };

  /* ================= FILTER ================= */
  const applyFilters = (source, search, status, from, to, page) => {

    let filtered = source.filter((row) => {
      const matchSearch =
        !search ||
        row.pq_number?.toLowerCase().includes(search.toLowerCase()) ||
        row.pr_number?.toLowerCase().includes(search.toLowerCase());

      const matchStatus =
        status === "All status" ||
        (row.pq_status || row.status)?.toLowerCase() === status.toLowerCase();

      const matchFrom =
        !from || new Date(row.pq_date) >= new Date(from);

      const matchTo =
        !to || new Date(row.pq_date) <= new Date(to);

      return matchSearch && matchStatus && matchFrom && matchTo;
    });

    setFilteredData(filtered); // ✅ IMPORTANT
    setTotalRecords(filtered.length);

    const start = (page - 1) * pageSize;
    setData(filtered.slice(start, start + pageSize));
    setCurrentPage(page);
  };

  useEffect(() => {
    loadPQs();
  }, []);
/* ================= APPROVE ================= */
const handleApprove = async (row) => {
  const result = await Swal.fire({
    title: "Approve Quotation?",
    text: `Approve PQ ${row.pq_number}?`,
    icon: "question",
    showCancelButton: true,
    confirmButtonColor: "#16a34a",
    confirmButtonText: "Yes, approve!",
  });

  if (result.isConfirmed) {
    try {
      const res = await api.post("/i_pi_purchase_quotation_approval_action", {
        pq_id: row.id,
        action: "Approved",
        approved_by_user_id: user?.id,
        user_id: user?.id,
        user_name: user?.name,
        pq_rejection_remarks: "",
      });

      if (res.data?.Status === 1 || res.data?.status === 1) {
        Swal.fire("Approved", "Quotation approved.", "success");
        loadPQs();
      } else {
        Swal.fire("Error", res.data?.message || "Approval failed.", "error");
      }
    } catch {
      Swal.fire("Error", "Server error.", "error");
    }
  }
};

/* ================= REJECT ================= */
const handleReject = async (row) => {
  const { value: reason, isConfirmed } = await Swal.fire({
    title: "Reject Quotation",
    input: "textarea",
    inputLabel: "Reason for rejection",
    showCancelButton: true,
    confirmButtonColor: "#dc2626",
    confirmButtonText: "Reject",
    inputValidator: (value) => {
      if (!value) return "Please enter rejection reason!";
    },
  });

  if (isConfirmed && reason) {
    try {
      const res = await api.post("/i_pi_purchase_quotation_approval_action", {
        pq_id: row.id,
        action: "Rejected",
        approved_by_user_id: user?.id,
        pq_rejection_remarks: reason,
      });

      if (res.data?.Status === 1 || res.data?.status === 1) {
        Swal.fire("Rejected", "Quotation rejected.", "success");
        loadPQs();
      } else {
        Swal.fire("Error", res.data?.message || "Rejection failed.", "error");
      }
    } catch {
      Swal.fire("Error", "Server error.", "error");
    }
  }
};

/* ================= FINALIZE ================= */
const handleFinalize = async (row) => {
  const result = await Swal.fire({
    title: "Finalize Quotation?",
    text: `Finalize PQ ${row.pq_number}?`,
    icon: "question",
    showCancelButton: true,
    confirmButtonColor: "#5b21b6",
    confirmButtonText: "Yes, finalize!",
  });

  if (result.isConfirmed) {
    try {
      const res = await api.post("/i_pi_purchase_quotation_approval_action", {
        pq_id: row.id,
        action: "Finalized",
        approved_by_user_id: user?.id,
        finalized_by_user_id: user?.id,
        user_id: user?.id,
        user_name: user?.name,
        pq_rejection_remarks: "",
      });

      if (res.data?.Status === 1 || res.data?.status === 1) {
        Swal.fire("Finalized", "Quotation finalized.", "success");
        loadPQs();
      } else {
        Swal.fire("Error", res.data?.message || "Finalize failed.", "error");
      }
    } catch {
      Swal.fire("Error", "Server error.", "error");
    }
  }
};
  /* ================= HANDLERS ================= */

  const handleSearch = (text) => {
    setSearchText(text);
    applyFilters(allData, text, statusFilter, dateFrom, dateTo, 1);
  };

  const handlePageChange = (page) => {
    const start = (page - 1) * pageSize;

    setData(filteredData.slice(start, start + pageSize)); // ✅ FIX
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

  /* ================= STAT FILTER ================= */
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
  const handleAdd = () => navigate("/Purchase_Quotation_form");
  const handleEdit = (row) => navigate(`/Purchase_Quotation_form?eid=${row.id}`);
  const handleView = (row) => navigate(`/Purchase_Quotation_form?view_id=${row.id}`);

  /* ================= DELETE ================= */
  const handleDelete = async (row) => {
    const result = await Swal.fire({
      title: "Are you sure?",
      text: `Delete quotation ${row.pq_number}?`,
      icon: "warning",
      showCancelButton: true,
      confirmButtonText: "Yes, delete it!",
    });

    if (result.isConfirmed) {
      try {
        const res = await api.post(`/i_pi_purchase_quotation_delete?id=${row.id}`);

        if (res.data?.status === 1 || res.data?.Status === 1) {
          Swal.fire("Deleted!", res.data.Message || "Quotation deleted.", "success");
          loadPQs();
        } else {
          Swal.fire("Error", res.data?.message || "Delete failed.", "error");
        }

      } catch {
        Swal.fire("Error", "Server error.", "error");
      }
    }
  };

  const statCards = [
    { label: "Total", value: stats.total, bg: "#f8fafc", color: "#334155", border: "#cbd5e1" },
    { label: "Draft", value: stats.draft, bg: "#f1f5f9", color: "#475569", border: "#cbd5e1" },
    { label: "Pending", value: stats.pending, bg: "#fef9c3", color: "#854d0e", border: "#fde047" },
    { label: "Approved", value: stats.approved, bg: "#dcfce7", color: "#166534", border: "#86efac" },
    { label: "Rejected", value: stats.rejected, bg: "#fee2e2", color: "#991b1b", border: "#fca5a5" },
    { label: "Finalized", value: stats.finalized, bg: "#ede9fe", color: "#5b21b6", border: "#c4b5fd" },
  ];

  return (
    <div className="flex min-h-screen">
      <Sidebar />

      <main className="flex-1 ml-64 min-h-screen bg-gray-50/50">
        <Header />

        <div className="p-8">
          <div className="max-w-[1200px] mx-auto space-y-8">

            <Grid
              title="Purchase Quotation Records"
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
              onReload={loadPQs}

              onEdit={handleEdit}
              onView={handleView}
              onDelete={handleDelete}

              onPageChange={handlePageChange}

              showApprove={true}
              onApprove={handleApprove}
              onReject={handleReject}
              showFinalize={true}
              onFinalize={handleFinalize}

              ignoreColumns={[
                "id","pq_pr_id","pq_created_by_user_id","pq_notes",
                "pq_approved_date","created_date","modified_date",
                "pq_approved_by_user_id","pq_finalized_by_user_id"
              ]}
            />

          </div>
        </div>
      </main>
    </div>
  );
};

export default Purchase_Quotation_list;