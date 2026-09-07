import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import Swal from "sweetalert2";

import api from "../../../services/axios";
import Grid from "../../../assets/Grid/Grid";
import Sidebar from "../../../components/Sidebar";
import Header from "../../../components/Header";

const Company_list = () => {
  const navigate = useNavigate();

  const [originalData, setOriginalData] = useState([]);
  const [filteredData, setFilteredData] = useState([]);
  const [data, setData] = useState([]);

  const [totalRecords, setTotalRecords] = useState(0);
  const [currentPage, setCurrentPage] = useState(1);

  const pageSize = 10;

  /* ================= LOAD ================= */
  const loadCompanies = async () => {
    try {
      const res = await api.get("/i_pi_company_mst_select_all_and_id", {
        params: { com_id: 0 },
      });

      const apiData = Array.isArray(res.data.Result) ? res.data.Result : [];

      setOriginalData(apiData);
      setFilteredData(apiData);

      setTotalRecords(apiData.length);
      setData(apiData.slice(0, pageSize));
      setCurrentPage(1);

    } catch (err) {
      Swal.fire("Error", "Failed to fetch companies", "error");
      setOriginalData([]);
      setFilteredData([]);
      setData([]);
    }
  };

  useEffect(() => {
    loadCompanies();
  }, []);

  /* ================= PAGINATION ================= */
  const handlePageChange = (page) => {
    const start = (page - 1) * pageSize;

    setData(filteredData.slice(start, start + pageSize)); // ✅ FIXED
    setCurrentPage(page);
  };

  /* ================= SEARCH ================= */
  const handleSearch = (text) => {
    const searchTerm = text.toLowerCase();

    const filtered = originalData.filter(
      (row) =>
        row.company_name?.toLowerCase().includes(searchTerm) ||
        row.email?.toLowerCase().includes(searchTerm) ||
        row.com_contact_person?.toLowerCase().includes(searchTerm)
    );

    setFilteredData(filtered); // ✅ IMPORTANT
    setTotalRecords(filtered.length);
    setCurrentPage(1);
    setData(filtered.slice(0, pageSize));
  };

  /* ================= ACTIONS ================= */
  const handleAdd = () => navigate("/Company_master");

  const handleEdit = (row) =>
    navigate(`/Company_master?eid=${row.com_id}`);

  const handleView = (row) =>
    navigate(`/Company_master?view_id=${row.com_id}`);

  const handleDelete = async (row) => {
    const result = await Swal.fire({
      title: "Are you sure?",
      text: `You want to delete ${row.company_name}?`,
      icon: "warning",
      showCancelButton: true,
      confirmButtonText: "Yes, delete it!",
    });

    if (result.isConfirmed) {
      try {
        const res = await api.post(
          `/i_pi_company_mst_delete?com_id=${row.com_id}`
        );

        if (res.data?.Status === 1 || res.data?.status === 1) {
          Swal.fire("Deleted", "Company has been deleted.", "success");
          loadCompanies();
        } else {
          Swal.fire("Error", res.data?.Message || "Delete failed", "error");
        }

      } catch {
        Swal.fire("Error", "Internal Server Error during delete", "error");
      }
    }
  };

  return (
    <div className="flex h-screen overflow-hidden">
      <Sidebar />

      <main className="flex-1 ml-64 flex flex-col h-full overflow-hidden">
        <Header />

        <div className="flex-1 overflow-y-auto p-4">
          <div className="max-w-[1200px] mx-auto">
            <div className="rounded-xl shadow-sm border">

              <Grid
                title="Company List"
                data={data}
                totalRecords={totalRecords}
                currentPage={currentPage}
                pageSize={pageSize}

                onSearch={handleSearch}
                onAdd={handleAdd}
                onReload={loadCompanies}

                onEdit={handleEdit}
                onView={handleView}
                onDelete={handleDelete}

                onPageChange={handlePageChange}

                ignoreColumns={[
                  "com_id",
                  "com_city",
                  "com_taluka",
                  "com_district",
                  "com_state",
                  "com_country",
                  "com_pincode",
                  "com_upload_logo",
                  "full_logo_url",
                  "com_status",
                  "com_is_delete",
                  "created_date",
                  "modify_date",
                  "is_active",
                ]}
              />

            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default Company_list;