import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import api from "../../../services/axios";
import Swal from "sweetalert2";
import Grid from "../../../assets/Grid/Grid";
import Sidebar from "../../../components/Sidebar";
import Header from "../../../components/Header";

const HSN_Code_List = () => {
  const navigate = useNavigate();

  /* ================= STATE ================= */
  const [originalData, setOriginalData] = useState([]);
  const [filteredData, setFilteredData] = useState([]);
  const [data, setData] = useState([]);

  const [totalRecords, setTotalRecords] = useState(0);
  const [currentPage, setCurrentPage] = useState(1);

  const pageSize = 30;

  /* ================= LOAD ================= */
  const loadHSN = async () => {
    try {
      const res = await api.get("/i_pi_hsn_code_mst_select_all_and_id", {
        params: { hsn_id: 0 },
      });

      const apiData = Array.isArray(res.data.Result) ? res.data.Result : [];

      /* ===== GROUPING LOGIC ===== */
      const groupedData = [];
      const map = new Map();

      for (const item of apiData) {
        if (!map.has(item.hsn_id)) {
          map.set(item.hsn_id, true);

          const allCodesForThisId = apiData
            .filter((x) => x.hsn_id === item.hsn_id)
            .map((x) => x.hsn_code)
            .join(", ");

          groupedData.push({
            ...item,
            effective_date: item.effective_date?.split("T")[0],
            hsn_code: allCodesForThisId,
          });
        }
      }

      /* ===== IMPORTANT PART ===== */
      setOriginalData(groupedData);
      setFilteredData(groupedData);

      setTotalRecords(groupedData.length);
      setData(groupedData.slice(0, pageSize));
      setCurrentPage(1);

    } catch (err) {
      console.error(err);
      Swal.fire("Error", "Failed to fetch HSN list", "error");

      setOriginalData([]);
      setFilteredData([]);
      setData([]);
    }
  };

  useEffect(() => {
    loadHSN();
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
        row.slab_name?.toLowerCase().includes(lower) ||
        row.hsn_code?.toString().toLowerCase().includes(lower)
    );

    setFilteredData(filtered); // ✅ VERY IMPORTANT
    setTotalRecords(filtered.length);
    setCurrentPage(1);
    setData(filtered.slice(0, pageSize));
  };

  /* ================= DELETE ================= */
  const handleDelete = async (row) => {
    const result = await Swal.fire({
      title: "Are you sure?",
      text: "You want to delete this HSN entry?",
      icon: "warning",
      showCancelButton: true,
      confirmButtonText: "Yes, delete it!",
    });

    if (result.isConfirmed) {
      try {
        const res = await api.post(
          `/i_pi_hsn_code_mst_delete?hsn_id=${row.hsn_id}`
        );

        if (res.data?.Status === 1 || res.data?.status === 1) {
          Swal.fire("Deleted", "Entry deleted successfully", "success");
          loadHSN();
        } else {
          Swal.fire("Error", "Delete failed", "error");
        }

      } catch {
        Swal.fire("Error", "Server error during delete", "error");
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
                title="HSN Code List"
                data={data}
                totalRecords={totalRecords}
                currentPage={currentPage}
                pageSize={pageSize}

                onSearch={handleSearch}
                onAdd={() => navigate("/HSN_Code_Master")}
                onReload={loadHSN}

                onEdit={(row) =>
                  navigate(`/HSN_Code_Master?eid=${row.hsn_id}`)
                }
                onView={(row) =>
                  navigate(`/HSN_Code_Master?view_id=${row.hsn_id}`)
                }
                onDelete={handleDelete}

                onPageChange={handlePageChange}

                ignoreColumns={[
                  "hsn_id",
                  "hsn_gst_slab",
                  "hsn_is_active",
                ]}
              />
            </div>

          </div>
        </div>
      </main>
    </div>
  );
};

export default HSN_Code_List;