import React, { useState, useEffect } from "react";
import api from "../../../services/axios";
import Swal from "sweetalert2";
import { useNavigate } from "react-router-dom";
import Sidebar from "../../../components/Sidebar"
import Header from "../../../components/Header";;
import Grid from "../../../assets/Grid/Grid";

const Department_list = () => {
  const navigate = useNavigate();
  const [data, setData] = useState([]);
  const [allData, setAllData] = useState([]);
  const [totalRecords, setTotalRecords] = useState(0);
  const [currentPage, setCurrentPage] = useState(1);
  const pageSize = 10;

  const loadDepartments = async () => {
    try {
      const res = await api.get("/i_pi_department_mst_select_all_and_id", {
        params: { dept_id: 0 },
      });
      const apiData = Array.isArray(res.data.Result) ? res.data.Result : [];
      setAllData(apiData);
      setTotalRecords(apiData.length);
      setData(apiData.slice(0, pageSize));
      setCurrentPage(1);
    } catch (err) {
      Swal.fire("Error", "Failed to fetch departments", "error");
      setAllData([]);
      setData([]);
    }
  };

  useEffect(() => {
    loadDepartments();
  }, []);

  const handlePageChange = (page) => {
    const start = (page - 1) * pageSize;
    setData(allData.slice(start, start + pageSize));
    setCurrentPage(page);
  };

  const handleSearch = (text) => {
    const filtered = allData.filter((row) =>
      row.department_name?.toLowerCase().includes(text.toLowerCase())
    );
    setData(filtered.slice(0, pageSize));
    setTotalRecords(filtered.length);
    setCurrentPage(1);
  };

  const handleAdd  = () => navigate("/Department_master");
  const handleEdit = (row) => navigate(`/Department_master?eid=${row.dept_id}`);
  const handleView = (row) => navigate(`/Department_master?view_id=${row.dept_id}`);

  const handleDelete = async (row) => {
    const result = await Swal.fire({
      title: "Are you sure?",
      text: `You want to delete "${row.department_name}"?`,
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#3085d6",
      cancelButtonColor: "#d33",
      confirmButtonText: "Yes, delete it!",
    });

    if (result.isConfirmed) {
      try {
        const res = await api.post(`/i_pi_department_mst_delete?dept_id=${row.dept_id}`);
        if (res.data?.status === 1 || res.data?.status === 1) {
          Swal.fire("Deleted!", res.data.Message || "Department deleted successfully", "success");
          loadDepartments();
        } else {
          Swal.fire("Action Blocked", res.data?.message || "Delete failed", "warning");
        }
      } catch (err) {
        console.error("Delete Error:", err);
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
              title="Department List"
              data={data}
              totalRecords={totalRecords}
              currentPage={currentPage}
              pageSize={pageSize}
              onSearch={handleSearch}
              onAdd={handleAdd}
              onReload={loadDepartments}
              onEdit={handleEdit}
              onView={handleView}
              onDelete={handleDelete}
              onPageChange={handlePageChange}
              ignoreColumns={["dept_id", "dept_is_active"]}
            />
          </div>
        </div>
        </div>
      </main>
    </div>
  );
};

export default Department_list;