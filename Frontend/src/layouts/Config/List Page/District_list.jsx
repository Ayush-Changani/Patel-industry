import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import api from "../../../services/axios";
import Swal from "sweetalert2";
import Grid from "../../../assets/Grid/Grid";
import Sidebar from "../../../components/Sidebar";
import Header from "../../../components/Header";

const District_list = () => {
  const navigate = useNavigate();

  const [originalData, setOriginalData] = useState([]);
  const [filteredData, setFilteredData] = useState([]);
  const [data, setData] = useState([]);

  const [totalRecords, setTotalRecords] = useState(0);
  const [currentPage, setCurrentPage] = useState(1);

  const pageSize = 10;

  /* ================= LOAD ================= */
  const loadDistricts = async () => {
    try {
      const res = await api.get("/i_pi_district_mst_select_all_and_id", {
        params: { dis_id: 0 },
      });

      const apiData = Array.isArray(res.data.Result) ? res.data.Result : [];

      setOriginalData(apiData);
      setFilteredData(apiData);

      setTotalRecords(apiData.length);
      setData(apiData.slice(0, pageSize));
      setCurrentPage(1);

    } catch (err) {
      Swal.fire("Error", "Failed to fetch districts", "error");
      setOriginalData([]);
      setFilteredData([]);
      setData([]);
    }
  };

  useEffect(() => {
    loadDistricts();
  }, []);

  /* ================= PAGINATION ================= */
  const handlePageChange = (page) => {
    const start = (page - 1) * pageSize;

    setData(filteredData.slice(start, start + pageSize)); // ✅ FIXED
    setCurrentPage(page);
  };

  /* ================= SEARCH ================= */
  const handleSearch = (text) => {
    const lower = text.toLowerCase();

    const filtered = originalData.filter(
      (row) =>
        row.district_name?.toLowerCase().includes(lower) ||
        row.state_name?.toLowerCase().includes(lower)
    );

    setFilteredData(filtered); // ✅ IMPORTANT
    setTotalRecords(filtered.length);
    setCurrentPage(1);
    setData(filtered.slice(0, pageSize));
  };

  /* ================= ACTIONS ================= */
  const handleAdd = () => navigate("/District_master");

  const handleEdit = (row) =>
    navigate(`/District_master?eid=${row.dis_id}`);

  const handleView = (row) =>
    navigate(`/District_master?view_id=${row.dis_id}`);

  const handleDelete = async (row) => {
    const result = await Swal.fire({
      title: "Are you sure?",
      text: `You want to delete ${row.district_name}?`,
      icon: "warning",
      showCancelButton: true,
      confirmButtonText: "Yes, delete it!",
    });

    if (result.isConfirmed) {
      try {
        const res = await api.post(
          `/i_pi_district_mst_delete?dis_id=${row.dis_id}`
        );

        if (res.data?.Status === 1 || res.data?.status === 1) {
          Swal.fire(
            "Deleted",
            res.data?.message || "District has been deleted.",
            "success"
          );
          loadDistricts();
        } else {
          Swal.fire(
            "Error",
            res.data?.message || "Delete failed",
            "error"
          );
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
                title="District List"
                data={data}
                totalRecords={totalRecords}
                currentPage={currentPage}
                pageSize={pageSize}

                onSearch={handleSearch}
                onAdd={handleAdd}
                onReload={loadDistricts}

                onEdit={handleEdit}
                onView={handleView}
                onDelete={handleDelete}

                onPageChange={handlePageChange}

                ignoreColumns={[
                  "dis_id",
                  "dis_state_name",
                  "dis_is_active",
                ]}
              />

            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default District_list;