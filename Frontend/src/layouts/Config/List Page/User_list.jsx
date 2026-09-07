import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import api from "../../../services/axios";
import Swal from "sweetalert2";
import Grid from "../../../assets/Grid/Grid";
import Sidebar from "../../../components/Sidebar";
import Header from "../../../components/Header";

const User_list = () => {
  const navigate = useNavigate();

  const [originalData, setOriginalData] = useState([]); 
  const [filteredData, setFilteredData] = useState([]);  
  const [data, setData] = useState([]); 

  const [totalRecords, setTotalRecords] = useState(0);
  const [currentPage, setCurrentPage] = useState(1);

  const pageSize = 10;

  /* ================= LOAD ================= */
  const loadUsers = async () => {
    try {
      const res = await api.get("/i_pi_user__mst_select_all_and_id", {
        params: { usr_id: 0 },
      });

      const apiData = Array.isArray(res.data.Result) ? res.data.Result : [];

      setOriginalData(apiData);
      setFilteredData(apiData);

      setTotalRecords(apiData.length);
      setData(apiData.slice(0, pageSize));
      setCurrentPage(1);

    } catch (err) {
      Swal.fire("Error", "Failed to fetch users", "error");
      setOriginalData([]);
      setFilteredData([]);
      setData([]);
    }
  };

  useEffect(() => {
    loadUsers();
  }, []);

  /* ================= PAGINATION ================= */
  const handlePageChange = (page) => {
    const start = (page - 1) * pageSize;

    setData(filteredData.slice(start, start + pageSize));
    setCurrentPage(page);
  };

  /* ================= SEARCH ================= */
  const handleSearch = (text) => {
    const lower = text.toLowerCase();

    const filtered = originalData.filter(
      (row) =>
        row.user_name?.toLowerCase().includes(lower) ||
        row.user_group?.toLowerCase().includes(lower) ||
        row.official_email?.toLowerCase().includes(lower)
    );

    setFilteredData(filtered);
    setTotalRecords(filtered.length);
    setCurrentPage(1);
    setData(filtered.slice(0, pageSize));
  };

  /* ================= ACTIONS ================= */
  const handleAdd = () => navigate("/User_Master");
  const handleEdit = (row) => navigate(`/User_Master?eid=${row.usr_id}`);
  const handleView = (row) => navigate(`/User_Master?view_id=${row.usr_id}`);

  const handleDelete = async (row) => {
    const result = await Swal.fire({
      title: "Are you sure?",
      text: `Delete user: ${row.user_name}?`,
      icon: "warning",
      showCancelButton: true,
      confirmButtonText: "Yes, delete!",
    });

    if (result.isConfirmed) {
      try {
        const res = await api.post(`/i_pi_user_detail_delete?usr_id=${row.usr_id}`);

        if (res.data?.Status === 1 || res.data?.status === 1) {
          Swal.fire("Deleted", res.data?.message || "User deleted successfully", "success");
          loadUsers();
        } else {
          Swal.fire("Error", res.data?.message || "Delete failed", "error");
        }

      } catch {
        Swal.fire("Error", "Server Error", "error");
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
                title="User List"
                data={data}
                totalRecords={totalRecords}
                currentPage={currentPage}
                pageSize={pageSize}

                onSearch={handleSearch}
                onAdd={handleAdd}
                onReload={loadUsers}

                onEdit={handleEdit}
                onView={handleView}
                onDelete={handleDelete}

                onPageChange={handlePageChange}

                ignoreColumns={[
                  "usr_id",
                  "usr_group",
                  "password",
                  "usr_is_active",
                  "company_id",
                  "dept_id",
                ]}
              />

            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default User_list;