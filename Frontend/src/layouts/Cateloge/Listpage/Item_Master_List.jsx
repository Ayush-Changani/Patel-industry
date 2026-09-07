import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import api from "../../../services/axios";
import Swal from "sweetalert2";
import Grid from "../../../assets/Grid/Grid";
import Sidebar from "../../../components/Sidebar"
import Header from "../../../components/Header";;

const Item_Master_List = () => {
  const navigate = useNavigate();
  const [data, setData] = useState([]);
  const [allData, setAllData] = useState([]);
  const [totalRecords, setTotalRecords] = useState(0);
  const [currentPage, setCurrentPage] = useState(1);
  const pageSize = 10;

  /* =======================
      FETCH DATA
  ======================= */
  const loadItems = async () => {
    try {
      const res = await api.get("/i_pi_item_master_mst_select_all_and_id", {
        params: { itm_id: 0 },
      });

      const apiData = Array.isArray(res.data.Result) ? res.data.Result : [];
      setAllData(apiData);
      setTotalRecords(apiData.length);
      setData(apiData.slice(0, pageSize));
      setCurrentPage(1);
    } catch (err) {
      console.error("Fetch error:", err);
      Swal.fire("Error", "Failed to fetch item list", "error");
      setAllData([]);
      setData([]);
    }
  };

  useEffect(() => {
    loadItems();
  }, []);

  /* =======================
      GRID HANDLERS
  ======================= */
  const handlePageChange = (page) => {
    const start = (page - 1) * pageSize;
    setData(allData.slice(start, start + pageSize));
    setCurrentPage(page);
  };

  const handleSearch = (text) => {
    const filtered = allData.filter(
      (row) =>
        row.item_name?.toLowerCase().includes(text.toLowerCase()) ||
        row.item_code?.toLowerCase().includes(text.toLowerCase()) ||
        row.item_category?.toLowerCase().includes(text.toLowerCase()),
    );
    setData(filtered.slice(0, pageSize));
    setTotalRecords(filtered.length);
    setCurrentPage(1);
  };

  const handleAdd = () => navigate("/Item_Master");
  const handleEdit = (row) => navigate(`/Item_Master?eid=${row.itm_id}`);
  const handleView = (row) => navigate(`/Item_Master?view_id=${row.itm_id}`);

  const handleDelete = async (row) => {
    const result = await Swal.fire({
      title: "Are you sure?",
      text: `You want to delete ${row.item_name}?`,
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#3085d6",
      cancelButtonColor: "#d33",
      confirmButtonText: "Yes, delete it!",
    });

    if (result.isConfirmed) {
      try {
        const res = await api.post(
          `/i_pi_item_master_mst_delete?itm_id=${row.itm_id}`,
        );

        if (res.data?.Status === 1 || res.data?.status === 1) {
          Swal.fire(
            "Deleted",
            res.data?.message || "Item has been deleted.",
            "success",
          );
          loadItems();
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
              title="Item Master List"
              data={data}
              totalRecords={totalRecords}
              currentPage={currentPage}
              pageSize={pageSize}
              onSearch={handleSearch}
              onAdd={handleAdd}
              onReload={loadItems}
              onEdit={handleEdit}
              onView={handleView}
              onDelete={handleDelete}
              onPageChange={handlePageChange}
              ignoreColumns={[
                "itm_id",
                "itm_item_category",
                "itm_uom",
                "itm_hsn_code",
                "itm_gst",
                "itm_is_active",
                "itm_appli_text",
              ]}
            />
          </div>
        </div>
        </div>
      </main>
    </div>
  );
};

export default Item_Master_List;
