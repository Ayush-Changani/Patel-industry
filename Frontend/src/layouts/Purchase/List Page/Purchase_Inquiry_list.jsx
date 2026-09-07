import React, { useState, useEffect } from "react";
import api from "../../../services/axios";
import Swal from "sweetalert2";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../../context/AuthContext";
import Sidebar from "../../../components/Sidebar";
import Header from "../../../components/Header";
import Grid from "../../../assets/Grid/Grid";

const Purchase_Inquiry_list = () => {
  const navigate = useNavigate();
  const { user } = useAuth();

  /* ================= STATE ================= */
  const [originalData, setOriginalData] = useState([]);
  const [filteredData, setFilteredData] = useState([]);
  const [data, setData] = useState([]);

  const [totalRecords, setTotalRecords] = useState(0);
  const [currentPage, setCurrentPage] = useState(1);

  const [stats, setStats] = useState({
    total: 0,
    draft: 0,
    sent: 0,
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
  const loadInquiries = async () => {
    try {
      const res = await api.get("/i_pi_purchase_inquiry_select_all_and_id", {
        params: { pi_id: 0 },
      });

      const apiData = Array.isArray(res.data.Result)
        ? res.data.Result
        : [];

      setOriginalData(apiData);
      setFilteredData(apiData);

      computeStats(apiData);

      setTotalRecords(apiData.length);
      setData(apiData.slice(0, pageSize));
      setCurrentPage(1);

    } catch {
      Swal.fire("Error", "Failed to fetch purchase inquiries", "error");

      setOriginalData([]);
      setFilteredData([]);
      setData([]);
    }
  };

  /* ================= STATS ================= */
  const computeStats = (list) => {
    setStats({
      total: list.length,
      draft: list.filter((r) => (r.status || r.pi_status || "").toLowerCase() === "draft").length,
      sent: list.filter((r) => (r.status || r.pi_status || "").toLowerCase() === "sent").length,
      approved: list.filter((r) => (r.status || r.pi_status || "").toLowerCase() === "approved").length,
      rejected: list.filter((r) => (r.status || r.pi_status || "").toLowerCase() === "rejected").length,
    });
  };

  useEffect(() => {
    loadInquiries();
  }, []);

  /* ================= COMMON FILTER ================= */
  const applyFilters = (search, status, from, to, page = 1) => {
    let filtered = originalData.filter((row) => {
      const matchSearch =
        !search ||
        row.pi_number?.toLowerCase().includes(search.toLowerCase()) ||
        row.pr_number?.toLowerCase().includes(search.toLowerCase());

      const matchStatus =
        status === "All status" ||
        (row.status || row.pi_status || "").toLowerCase() === status.toLowerCase();

      const matchFrom =
        !from || new Date(row.pi_date) >= new Date(from);

      const matchTo =
        !to || new Date(row.pi_date) <= new Date(to);

      return matchSearch && matchStatus && matchFrom && matchTo;
    });

    setFilteredData(filtered); // ✅ KEY FIX
    setTotalRecords(filtered.length);

    const start = (page - 1) * pageSize;
    setData(filtered.slice(start, start + pageSize));
    setCurrentPage(page);
  };

  /* ================= HANDLERS ================= */

  const handleSearch = (text) => {
    setSearchText(text);
    applyFilters(text, statusFilter, dateFrom, dateTo, 1);
  };

  const handlePageChange = (page) => {
    const start = (page - 1) * pageSize;

    setData(filteredData.slice(start, start + pageSize)); // ✅ FIX
    setCurrentPage(page);
  };

  const handleGridFilterChange = (key, value) => {
    if (key === "status") {
      setStatusFilter(value || "All status");
      applyFilters(searchText, value || "All status", dateFrom, dateTo, 1);
    }
  };

  const handleClear = () => {
    setSearchText("");
    setStatusFilter("All status");
    setDateFrom("");
    setDateTo("");
    setActiveStatFilter("");

    applyFilters("", "All status", "", "", 1);
  };

  const handleStatClick = (label) => {
    if (activeStatFilter === label) {
      setActiveStatFilter("");
      setStatusFilter("All status");
      applyFilters(searchText, "All status", dateFrom, dateTo, 1);
    } else {
      setActiveStatFilter(label);
      const newStatus = label === "Total" ? "All status" : label;
      setStatusFilter(newStatus);
      applyFilters(searchText, newStatus, dateFrom, dateTo, 1);
    }
  };

  /* ================= ACTIONS ================= */

  const handleAdd = () => navigate("/Purchase_Inquiry_form");
  const handleEdit = (row) =>
    navigate(`/Purchase_Inquiry_form?eid=${row.pi_id}`);
  const handleView = (row) =>
    navigate(`/Purchase_Inquiry_form?view_id=${row.pi_id}`);

  const handleDelete = async (row) => {
    const result = await Swal.fire({
      title: "Are you sure?",
      text: `Delete inquiry ${row.pi_number}?`,
      icon: "warning",
      showCancelButton: true,
      confirmButtonText: "Yes, delete it!",
    });

    if (result.isConfirmed) {
      try {
        const res = await api.post(
          `/i_pi_purchase_inquiry_delete?id=${row.id}`
        );

        if (res.data?.status === 1 || res.data?.Status === 1) {
          Swal.fire("Deleted!", "Inquiry deleted.", "success");
          loadInquiries();
        } else {
          Swal.fire("Error", res.data?.message || "Delete failed.", "error");
        }
      } catch {
        Swal.fire("Error", "Server error during delete.", "error");
      }
    }
  };
/* ================= APPROVE ================= */
const handleApprove = async (row) => {
  const result = await Swal.fire({
    title: "Approve Inquiry?",
    text: `Approve PI ${row.pi_number}?`,
    icon: "question",
    showCancelButton: true,
    confirmButtonColor: "#16a34a",
    confirmButtonText: "Yes, approve!",
  });

  if (result.isConfirmed) {
    try {
      const res = await api.post("/i_pi_purchase_inquiry_approval_action", {
        pi_id: row.pi_id,
        action: "Approved",
        approved_by_user_id: user?.id,
        user_id: user?.id,
        user_name: user?.name,
        pi_rejection_remarks: "",
      });

      if (res.data?.Status === 1 || res.data?.status === 1) {
        Swal.fire("Approved", "Inquiry approved.", "success");
        loadInquiries();
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
    title: "Reject Inquiry",
    input: "textarea",
    inputLabel: "Reason for rejection",
    inputPlaceholder: "Enter reason here...",
    showCancelButton: true,
    confirmButtonColor: "#dc2626",
    confirmButtonText: "Reject",
    inputValidator: (value) => {
      if (!value) return "Please enter rejection reason!";
    },
  });

  if (isConfirmed && reason) {
    try {
      const res = await api.post("/i_pi_purchase_inquiry_approval_action", {
        pi_id: row.pi_id,
        action: "Rejected",
        approved_by_user_id: user?.id,
        pi_rejection_remarks: reason,
      });

      if (res.data?.Status === 1 || res.data?.status === 1) {
        Swal.fire("Rejected", "Inquiry rejected.", "success");
        loadInquiries();
      } else {
        Swal.fire("Error", res.data?.message || "Rejection failed.", "error");
      }
    } catch {
      Swal.fire("Error", "Server error.", "error");
    }
  }
};
  /* ================= UI ================= */

  const statCards = [
    { label: "Total", value: stats.total, bg: "#f8fafc", color: "#334155", border: "#cbd5e1" },
    { label: "Draft", value: stats.draft, bg: "#f1f5f9", color: "#475569", border: "#cbd5e1" },
    { label: "Sent", value: stats.sent, bg: "#fef3c7", color: "#92400e", border: "#fcd34d" },
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
  title="Purchase Inquiry Records"
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
  onReload={loadInquiries}

  onEdit={handleEdit}
  onView={handleView}
  onDelete={handleDelete}
  onPageChange={handlePageChange}

  /* ✅ FIX ADDED */
  showApprove={true}
  onApprove={handleApprove}
  onReject={handleReject}

  ignoreColumns={[
    "pi_id",
    "pi_pr_id",
    "pi_entity_id",
    "pi_entity_group_id",
    "pi_department_id",
    "pi_prepared_by_user_id",
    "pi_remarks",
    "terms_conditions",
    "created_date",
    "modified_date",
    "pi_approval_date",
    "pi_approved_by_user_id",
    "pi_rejection_remarks",
  ]}
/>
          </div>
        </div>
      </main>
    </div>
  );
};

export default Purchase_Inquiry_list;