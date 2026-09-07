import React, { useState, useEffect } from "react";
import api from "../../../services/axios";
import Swal from "sweetalert2";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../../context/AuthContext";
import Sidebar from "../../../components/Sidebar";
import Header from "../../../components/Header";
import Grid from "../../../assets/Grid/Grid";
import { downloadPurchaseInvoicePDF } from "../../../components/PdfTemplates/PurchaseInvoicePDF";

const Purchase_Invoice_list = () => {
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
    pending: 0,
    approved: 0,
    rejected: 0,
    paid: 0,
    overdue: 0,
  });

  const pageSize = 10;

  const [searchText, setSearchText] = useState("");
  const [statusFilter, setStatusFilter] = useState("All status");
  const [dateFrom, setDateFrom] = useState("");
  const [dateTo, setDateTo] = useState("");
  const [activeStatFilter, setActiveStatFilter] = useState("");

  /* ================= LOAD ================= */
  const loadInvoices = async () => {
    try {
      const res = await api.get("/i_pi_purchase_invoice_select_all_and_id", {
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
      Swal.fire("Error", "Failed to fetch purchase invoices", "error");

      setOriginalData([]);
      setFilteredData([]);
      setData([]);
    }
  };

  /* ================= STATS ================= */
  const computeStats = (list) => {
    setStats({
      total: list.length,
      draft: list.filter((r) => r.status?.toLowerCase() === "draft").length,
      pending: list.filter((r) => r.status?.toLowerCase() === "pending").length,
      approved: list.filter((r) => r.status?.toLowerCase() === "approved").length,
      rejected: list.filter((r) => r.status?.toLowerCase() === "rejected").length,
      paid: list.filter((r) => r.status?.toLowerCase() === "paid").length,
      overdue: list.filter((r) => r.status?.toLowerCase() === "overdue").length,
    });
  };

  useEffect(() => {
    loadInvoices();
  }, []);

  /* ================= FILTER ================= */
  const applyFilters = (search, status, from, to, page = 1) => {
    let filtered = originalData.filter((row) => {
      const matchSearch =
        !search ||
        row.invoice_number?.toLowerCase().includes(search.toLowerCase()) ||
        row.vendor_name?.toLowerCase().includes(search.toLowerCase());

      const matchStatus =
        status === "All status" ||
        row.status?.toLowerCase() === status.toLowerCase();

      const matchFrom =
        !from || new Date(row.invoice_date) >= new Date(from);

      const matchTo =
        !to || new Date(row.invoice_date) <= new Date(to);

      return matchSearch && matchStatus && matchFrom && matchTo;
    });

    setFilteredData(filtered); // ✅ IMPORTANT
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

  const handleFilterChange = (type, value) => {
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

    applyFilters(searchText, st, df, dt, 1);
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

  const handleAdd = () => navigate("/Purchase_Invoice_form");
  const handleEdit = (row) => navigate(`/Purchase_Invoice_form?eid=${row.pinv_id}`);
  const handleView = (row) => navigate(`/Purchase_Invoice_form?view_id=${row.pinv_id}`);

  const handleDelete = async (row) => {
    const result = await Swal.fire({
      title: "Delete Invoice?",
      text: row.invoice_number,
      icon: "warning",
      showCancelButton: true,
    });

    if (result.isConfirmed) {
      try {
        const res = await api.post(
          `/i_pi_purchase_invoice_delete?id=${row.pinv_id}`
        );

        if (res.data?.Status === 1) {
          Swal.fire("Deleted", res.data.Message, "success");
          loadInvoices();
        }
      } catch {
        Swal.fire("Error", "Delete failed", "error");
      }
    }
  };

  const handleExportPdf = async (row) => {
    try {
      Swal.fire({
        title: "Generating PDF...",
        allowOutsideClick: false,
        didOpen: () => Swal.showLoading(),
      });

      await downloadPurchaseInvoicePDF(row.pinv_id, row);

      Swal.close();
    } catch {
      Swal.fire("Error", "PDF generation failed", "error");
    }
  };

  const handleApprove = async (row) => {
    const result = await Swal.fire({
      title: "Approve Invoice?",
      text: `Approve Invoice ${row.invoice_number}?`,
      icon: "question",
      showCancelButton: true,
      confirmButtonColor: "#16a34a",
      confirmButtonText: "Yes, approve!",
    });

    if (result.isConfirmed) {
      try {
        const payload = {
          pinv_id: row.pinv_id,
          action: "Approved",
          approved_by_user_id: user?.id || 0,
          pinv_rejection_remarks: "",
        };

        const res = await api.post("/i_pi_purchase_invoice_approval_action", payload);

        if (res.data?.Status === 1 || res.data?.status === 1) {
          Swal.fire("Approved", "Invoice approved successfully", "success");
          loadInvoices();
        } else {
          Swal.fire("Error", res.data?.Message || res.data?.message || "Approval failed", "error");
        }
      } catch {
        Swal.fire("Error", "Server error during approval", "error");
      }
    }
  };

  /* ================= REJECT ================= */
  const handleReject = async (row) => {
    const { value: reason, isConfirmed } = await Swal.fire({
      title: "Reject Invoice",
      input: "textarea",
      inputPlaceholder: "Enter reason...",
      showCancelButton: true,
      confirmButtonColor: "#dc2626",
      confirmButtonText: "Reject",
      inputValidator: (v) => (!v ? "Reason required" : undefined),
    });

    if (isConfirmed && reason) {
      try {
        const payload = {
          pinv_id: row.pinv_id,
          action: "Rejected",
          approved_by_user_id: user?.id || 0,
          pinv_rejection_remarks: reason,
        };

        const res = await api.post("/i_pi_purchase_invoice_approval_action", payload);

        if (res.data?.Status === 1 || res.data?.status === 1) {
          Swal.fire("Rejected", "Invoice rejected successfully", "success");
          loadInvoices();
        } else {
          Swal.fire("Error", res.data?.Message || res.data?.message || "Reject failed", "error");
        }
      } catch {
        Swal.fire("Error", "Server error", "error");
      }
    }
  };

  /* ================= PAID ================= */
  const handlePaid = async (row) => {
    const result = await Swal.fire({
      title: "Mark as Paid?",
      text: `Mark Invoice ${row.invoice_number} as Paid?`,
      icon: "question",
      showCancelButton: true,
      confirmButtonColor: "#16a34a",
      confirmButtonText: "Yes, Mark Paid!",
    });

    if (result.isConfirmed) {
      try {
        const payload = {
          pinv_id: row.pinv_id,
          action: "Paid",
          approved_by_user_id: user?.id || 0,
          pinv_rejection_remarks: "",
        };

        const res = await api.post("/i_pi_purchase_invoice_approval_action", payload);

        if (res.data?.Status === 1 || res.data?.status === 1) {
          Swal.fire("Paid", "Invoice marked as paid successfully", "success");
          loadInvoices();
        } else {
          Swal.fire("Error", res.data?.Message || res.data?.message || "Action failed", "error");
        }
      } catch {
        Swal.fire("Error", "Server error", "error");
      }
    }
  };
  /* ================= UI ================= */

  const statCards = [
    { label: "Total", value: stats.total, bg: "#f8fafc", color: "#334155", border: "#cbd5e1" },
    { label: "Draft", value: stats.draft, bg: "#f1f5f9", color: "#475569", border: "#cbd5e1" },
    { label: "Pending", value: stats.pending, bg: "#fef9c3", color: "#854d0e", border: "#fde047" },
    { label: "Approved", value: stats.approved, bg: "#dcfce7", color: "#166534", border: "#86efac" },
    { label: "Rejected", value: stats.rejected, bg: "#fee2e2", color: "#991b1b", border: "#fca5a5" },
    { label: "Paid", value: stats.paid, bg: "#dbeafe", color: "#1e40af", border: "#93c5fd" },
    { label: "Overdue", value: stats.overdue, bg: "#ffedd5", color: "#c2410c", border: "#fdba74" },
  ];

  return (
    <div className="flex min-h-screen">
      <Sidebar />

      <main className="flex-1 ml-64 bg-gray-50/50 min-h-screen">
        <Header />

        <div className="p-8">
          <div className="max-w-[1200px] mx-auto space-y-8">

            <Grid
              title="Purchase Invoice Records"
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
              onReload={loadInvoices}

              onEdit={handleEdit}
              onView={handleView}
              onDelete={handleDelete}

              onPageChange={handlePageChange}

              showExportPdf={true}
              onExportPdf={handleExportPdf}

              showApprove={true}
              onApprove={handleApprove}
              onReject={handleReject}

              showPaid={true}
              onPaid={handlePaid}

              ignoreColumns={[
                "pinv_id",
                "pinv_po_id",
                "pinv_grn_id",
                "pinv_vendor_id",
                "reject_remark",
                "approved_date",
                "approved_by_user",
                "created_by",
                "created_date",
                "modified_date",
              ]}
            />

          </div>
        </div>
      </main>
    </div>
  );
};

export default Purchase_Invoice_list;