import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import api from "../../../services/axios";
import Swal from "sweetalert2";
import Grid from "../../../assets/Grid/Grid";
import Sidebar from "../../../components/Sidebar"
import Header from "../../../components/Header";;

const User_Group_list = () => {
  const navigate = useNavigate();
  const [data, setData] = useState([]);
  const [allData, setAllData] = useState([]);
  const [totalRecords, setTotalRecords] = useState(0);
  const [currentPage, setCurrentPage] = useState(1);
  const pageSize = 30;

  const loadGroups = async () => {
    try {
      const res = await api.get("/i_pi_user_group_mst_select_all_and_id", {
        params: { ug_id: 0 },
      });
      const apiData = Array.isArray(res.data.Result) ? res.data.Result : [];
      setAllData(apiData);
      setTotalRecords(apiData.length);
      setData(apiData.slice(0, pageSize));
      setCurrentPage(1);
    } catch (err) {
      Swal.fire("Error", "Failed to fetch user groups", "error");
      setAllData([]);
      setData([]);
    }
  };

  useEffect(() => {
    loadGroups();
  }, []);

  const handlePageChange = (page) => {
    const start = (page - 1) * pageSize;
    setData(allData.slice(start, start + pageSize));
    setCurrentPage(page);
  };

  const handleSearch = (text) => {
    const filtered = allData.filter((row) =>
      row.user_group_name?.toLowerCase().includes(text.toLowerCase()),
    );
    setData(filtered.slice(0, pageSize));
    setTotalRecords(filtered.length);
    setCurrentPage(1);
  };

  const handleAdd = () => navigate("/User_Group_master");
  const handleEdit = (row) => navigate(`/User_Group_master?eid=${row.ug_id}`);
  const handleView = (row) =>
    navigate(`/User_Group_master?view_id=${row.ug_id}`);

  const handleDelete = async (row) => {
    const result = await Swal.fire({
      title: "Are you sure?",
      text: `You want to delete ${row.user_group_name}?`,
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#3085d6",
      cancelButtonColor: "#d33",
      confirmButtonText: "Yes, delete it!",
    });

    if (result.isConfirmed) {
      try {
        const res = await api.post(
          `/i_pi_user_group_mst_delete?ug_id=${row.ug_id}`,
        );

        if (res.data?.Status === 1 || res.data?.status === 1) {
          Swal.fire("Deleted",res.data?.message || "User group has been deleted.", "success");
          loadGroups();
        } else {
          Swal.fire("Error", res.data?.message || "Delete failed", "error");
        }
      } catch (err) {
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
              title="User Group List"
              data={data}
              totalRecords={totalRecords}
              currentPage={currentPage}
              pageSize={pageSize}
              onSearch={handleSearch}
              onAdd={handleAdd}
              onReload={loadGroups}
              onEdit={handleEdit}
              onView={handleView}
              onDelete={handleDelete}
              onPageChange={handlePageChange}
              ignoreColumns={["ug_id", "ug_is_active"]}
            />
          </div>
        </div>
        </div>
      </main>
    </div>
  );
};

export default User_Group_list;
