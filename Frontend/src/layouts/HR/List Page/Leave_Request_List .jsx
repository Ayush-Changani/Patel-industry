import React, { useState, useEffect } from "react";
import api from "../../../services/axios";
import Swal from "sweetalert2";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../../context/AuthContext";
import Sidebar from "../../../components/Sidebar";
import Header from "../../../components/Header";
import Grid from "../../../assets/Grid/Grid";

const Leave_Request_List = () => {
  const navigate = useNavigate();
  const { user } = useAuth();

  const [data, setData] = useState([]);
  const [allData, setAllData] = useState([]);
  const [totalRecords, setTotalRecords] = useState(0);
  const [currentPage, setCurrentPage] = useState(1);

  const [stats, setStats] = useState({
    total: 0,
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

  /* ── Load Leave Data ── */
  const loadLeaves = async () => {
    try {
      const res = await api.get("/i_pi_leave_request_get", {
        params: { lr_employee_id: 0 },
      });

      const apiData = Array.isArray(res.data.Result) ? res.data.Result : [];

      setAllData(apiData);
      computeStats(apiData);
      applyFilters(apiData, searchText, statusFilter, dateFrom, dateTo, 1);
    } catch {
      Swal.fire("Error", "Failed to fetch leave requests", "error");
      setAllData([]);
      setData([]);
    }
  };

  /* ── Stats ── */
  const computeStats = (list) => {
    setStats({
      total: list.length,
      pending: list.filter((r) => r.status?.toLowerCase() === "pending")
        .length,
      approved: list.filter((r) => r.status?.toLowerCase() === "approved")
        .length,
      rejected: list.filter((r) => r.status?.toLowerCase() === "rejected")
        .length,
    });
  };

  /* ── Filter ── */
  const applyFilters = (source, search, status, from, to, page) => {
    let filtered = source.filter((row) => {
      const matchSearch =
        !search ||
        row.lr_reason?.toLowerCase().includes(search.toLowerCase());

      const matchStatus =
        status === "All status" ||
        row.status?.toLowerCase() === status.toLowerCase();

      const matchFrom = !from || new Date(row.lr_from_date) >= new Date(from);
      const matchTo = !to || new Date(row.lr_to_date) <= new Date(to);

      return matchSearch && matchStatus && matchFrom && matchTo;
    });

    setTotalRecords(filtered.length);
    const start = (page - 1) * pageSize;
    setData(filtered.slice(start, start + pageSize));
    setCurrentPage(page);
  };

  useEffect(() => {
    loadLeaves();
  }, []);

  const handleSearch = (text) => {
    setSearchText(text);
    applyFilters(allData, text, statusFilter, dateFrom, dateTo, 1);
  };

  const handleClear = () => {
    setSearchText("");
    setStatusFilter("All status");
    setDateFrom("");
    setDateTo("");
    setActiveStatFilter("");
    applyFilters(allData, "", "All status", "", "", 1);
  };

  /* ── Stat Card Click → inline filter ── */
  const handleStatClick = (label) => {
    // Toggle: click the same card again to deselect
    if (activeStatFilter === label) {
      setActiveStatFilter("");
      setStatusFilter("All status");
      applyFilters(allData, searchText, "All status", dateFrom, dateTo, 1);
    } else {
      setActiveStatFilter(label);
      // "Total" means show all; otherwise map label to status
      const newStatus = label === "Total" ? "All status" : label;
      setStatusFilter(newStatus);
      applyFilters(allData, searchText, newStatus, dateFrom, dateTo, 1);
    }
  };

  const handlePageChange = (page) => {
    applyFilters(allData, searchText, statusFilter, dateFrom, dateTo, page);
  };

  /* ── Navigation ── */
  const handleAdd = () => navigate("/Leave_Master");
  const handleEdit = (row) => navigate(`/Leave_Master?eid=${row.lr_id}`);
  const handleView = (row) => navigate(`/Leave_Master?view_id=${row.lr_id}`);

  /* ── Approve ── */
  const handleApprove = async (row) => {
    const result = await Swal.fire({
      title: "Approve Leave?",
      text: "Do you want to approve this leave request?",
      icon: "question",
      showCancelButton: true,
      confirmButtonColor: "#16a34a",
    });

    if (result.isConfirmed) {
      try {
        const res = await api.post("/i_pi_leave_approval_action", {
          lr_id: row.lr_id,
          action: "Approved",
          approved_by_user_id: user?.id,
          remarks: "",
        });

        if (res.data?.Status === 1 || res.data?.status === 1) {
          Swal.fire("Approved!",res.data?.Message ||res.data?.message || "Leave approved successfully", "success");
          loadLeaves();
        } else {
          Swal.fire("Error", res.data?.message ||res.data?.Message || "Failed", "error");
        }
      } catch {
        Swal.fire("Error", "Server error", "error");
      }
    }
  };

  /* ── Reject ── */
  const handleReject = async (row) => {
    const { value: reason, isConfirmed } = await Swal.fire({
      title: "Reject Leave",
      input: "textarea",
      inputLabel: "Reason",
      showCancelButton: true,
      confirmButtonColor: "#dc2626",
      inputValidator: (value) => {
        if (!value) return "Enter reason!";
      },
    });

    if (isConfirmed && reason) {
      try {
        const res = await api.post("/i_pi_leave_approval_action", {
          lr_id: row.lr_id,
          action: "Rejected",
          approved_by_user_id: user?.id,
          remarks: reason,
        });

        if (res.data?.Status === 1||res.data?.status === 1) {
          Swal.fire("Rejected!",res.data?.Message ||res.data?.message || "Leave rejected", "success");
          loadLeaves();
        } else {
          Swal.fire("Error", res.data?.Message ||res.data?.message || "Failed", "error");
        }
      } catch {
        Swal.fire("Error", "Server error", "error");
      }
    }
  };

  /* ── Delete ── */
  const handleDelete = async (row) => {
    const result = await Swal.fire({
      title: "Delete?",
      text: "Are you sure?",
      icon: "warning",
      showCancelButton: true,
    });

    if (result.isConfirmed) {
      try {
        const res = await api.post(`/i_pi_leave_request_delete?id=${row.lr_id}`);
        if (res.data?.Status === 1) {
          Swal.fire("Deleted!", "Record deleted", "success");
          loadLeaves();
        }
      } catch {
        Swal.fire("Error", "Server error", "error");
      }
    }
  };

  /* ── Stats Cards ── */
  const statCards = [
    { label: "Total",    value: stats.total,    bg: "#f8fafc", color: "#334155", border: "#cbd5e1" },
    { label: "Pending",  value: stats.pending,  bg: "#fef9c3", color: "#854d0e", border: "#fde047" },
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
              title="Leave Requests"
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
              onReload={loadLeaves}
              onEdit={handleEdit}
              onView={handleView}
              onDelete={handleDelete}
              onPageChange={handlePageChange}
              showApprove={true}
              onApprove={handleApprove}
              onReject={handleReject}
              ignoreColumns={[
                "lr_id",
                "created_date",
                "modified_date",
                "approved_by_user_id",
                "lr_rejection_remarks",
                "lr_leave_type",
                "lr_from_date",
                "lr_to_date",
                "lr_total_days",
                "lr_approved_by_user_id",
                "lr_employee_id"
              ]}
            />
          </div>
        </div>
      </main>
    </div>
  );
};

export default Leave_Request_List;