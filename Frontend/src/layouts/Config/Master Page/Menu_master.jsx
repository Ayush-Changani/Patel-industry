import React, { useState, useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import Swal from "sweetalert2";
import api from "../../../services/axios";

import Card from "../../../components/Card";
import Input from "../../../components/Input";
import Button from "../../../components/Button";
import Sidebar from "../../../components/Sidebar";
import Footer from "../../../components/Footer";
import Header from "../../../components/Header";
import Select from "../../../components/Select";

const Menu_master = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const query = new URLSearchParams(location.search);

  const editId = query.get("eid");
  const viewId = query.get("view_id");

  const isEdit = Boolean(editId);
  const isView = Boolean(viewId);

  const currentId = editId || viewId || 0;

  const [loading, setLoading] = useState(false);

  const [form, setForm] = useState({
    subMenuName: "",
    pageUrl1: "",
    pageUrl2: "",
    icon: "",
    isActive: true,
  });

  const [masterMenu, setMasterMenu] = useState(null);
  const [masterMenuOptions, setMasterMenuOptions] = useState([]);

  const [company, setCompany] = useState([]);
  const [companyOptions, setCompanyOptions] = useState([]);

  /* ================= MASTER MENU LIST ================= */

  const fetchMasterMenu = async (search = "") => {
    try {
      const res = await api.get("/i_pi_get_all_master_menu_ddl", {
        params: { SearchTerm: search || "" },
      });

      if (res.data?.Status === 1) {
        const mapped = res.data.Result.map((m) => ({
          value: String(m.id),
          label: m.menu_name,
        }));

        setMasterMenuOptions(mapped);
        return mapped;
      }

      return [];
    } catch (err) {
      console.error(err);
      return [];
    }
  };

  /* ================= COMPANY LIST ================= */

  const fetchCompany = async (search = "") => {
    try {
      const res = await api.get("/i_pi_get_all_company_ddl", {
        params: { SearchTerm: search || "" },
      });

      if (res.data?.Status === 1) {
        const mapped = res.data.Result.map((c) => ({
          value: String(c.com_id),
          label: c.company_name,
        }));

        setCompanyOptions(mapped);
        return mapped;
      }

      return [];
    } catch (err) {
      console.error(err);
      return [];
    }
  };

  /* ================= GET MENU DETAIL ================= */

  const fetchMenuDetail = async (id, masterList, companyList) => {
    try {
      const res = await api.get("/i_pi_menu_detail_select_all_and_id", {
        params: { id: id },
      });

      if (res.data?.Status === 1 && res.data.Result.length > 0) {
        const data = res.data.Result[0];

        setForm({
          subMenuName: data.menu_name || "",
          pageUrl1: data.list_page || "",
          pageUrl2: data.form_page || "",
          icon: data.md_icon || "",
          isActive: data.md_status === 1,
        });

        /* ===== Find Master Menu Option ===== */
        const masterSelected = masterList.find(
          (x) => x.value === String(data.md_master_menu_id)
        );
        if (masterSelected) setMasterMenu(masterSelected);

        /* ===== Find Company Options (multi) ===== */
        const rawIds = data.md_company_id;

        if (rawIds !== null && rawIds !== undefined) {
          // Support both a single value and a comma-separated string
          const idList = Array.isArray(rawIds)
            ? rawIds.map(String)
            : String(rawIds)
                .split(",")
                .map((s) => s.trim())
                .filter(Boolean);

          const companySelected = companyList.filter((x) =>
            idList.includes(x.value)
          );

          if (companySelected.length > 0) setCompany(companySelected);
        }
      }
    } catch (err) {
      console.error(err);
      Swal.fire("Error", "Failed to fetch menu detail", "error");
    }
  };

  /* ================= INITIAL LOAD ================= */

  useEffect(() => {
    const init = async () => {
      setLoading(true);

      const masterList = await fetchMasterMenu("");
      const companyList = await fetchCompany("");

      if (currentId && currentId !== "0") {
        await fetchMenuDetail(currentId, masterList, companyList);
      }

      setLoading(false);
    };

    init();
  }, []);

  /* ================= SUBMIT ================= */

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (isView) return;

    if (!form.subMenuName || !masterMenu) {
      Swal.fire("Validation", "Please fill all required fields", "warning");
      return;
    }

    setLoading(true);

    try {
      const formData = new FormData();

      formData.append("id", currentId);
      formData.append("md_master_menu_id", masterMenu.value);
      formData.append("md_sub_menu_name", form.subMenuName);
      formData.append("md_page_url_1", form.pageUrl1);
      formData.append("md_page_url_2", form.pageUrl2);
      formData.append("md_icon", form.icon);
      formData.append("md_status", form.isActive ? 1 : 0);

      // ✅ Send only company IDs as comma-separated string e.g. "1,2,3"
      formData.append("md_company_id", company.map((c) => c.value).join(",") || 0);

      const res = await api.post("/i_pi_menu_detail_insert", formData);

      if (res.data?.Status === 1 || res.data?.status === 1) {
        Swal.fire("Success", res.data.message || "Saved successfully", "success");
        navigate("/Menu_list");
      } else {
        Swal.fire("Warning", res.data.message || "Operation failed", "warning");
      }
    } catch (err) {
  console.error("Full error:", err);
  console.error("Response data:", err.response?.data);
  console.error("Response status:", err.response?.status);
  
  Swal.fire(
    "Error",
    err.response?.data?.message || err.response?.data?.Message || err.message || "Server Error",
    "error"
  );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex h-screen overflow-hidden">
      <Sidebar />

      <main className="flex-1 ml-64 flex flex-col h-full overflow-hidden">
        <Header />

        <div className="flex-1 overflow-y-auto p-8 custom-scrollbar-sidebar">
          <div className="max-w-6xl mx-auto">
            <Card title={"Menu Detail"}>
              <form onSubmit={handleSubmit} className="grid grid-cols-2 gap-4 p-2">

                <Select
                  label="Master Menu"
                  options={masterMenuOptions}
                  value={masterMenu}
                  onChange={setMasterMenu}
                  searchable
                  serverSearch
                  onSearch={fetchMasterMenu}
                  placeholder="Search Master Menu"
                  disabled={isView}
                />

                <Input
                  label="Sub Menu Name"
                  value={form.subMenuName}
                  onChange={(e) =>
                    setForm({ ...form, subMenuName: e.target.value })
                  }
                  required
                  disabled={isView}
                />

                <Input
                  label="Page URL 1"
                  value={form.pageUrl1}
                  onChange={(e) =>
                    setForm({ ...form, pageUrl1: e.target.value })
                  }
                  disabled={isView}
                />

                <Input
                  label="Page URL 2"
                  value={form.pageUrl2}
                  onChange={(e) =>
                    setForm({ ...form, pageUrl2: e.target.value })
                  }
                  disabled={isView}
                />

                <Select
                  label="Company"
                  options={companyOptions}
                  value={company}
                  onChange={setCompany}
                  searchable
                  serverSearch
                  multi={true}
                  onSearch={fetchCompany}
                  placeholder="Search Company"
                  disabled={isView}
                />

                <Input
                  label="Icon"
                  value={form.icon}
                  onChange={(e) =>
                    setForm({ ...form, icon: e.target.value })
                  }
                  disabled={isView}
                />

                <div className="col-span-2 flex items-center gap-2 mt-2">
                  <Input
                    type="checkbox"
                    label="Active"
                    checked={form.isActive}
                    onChange={(e) =>
                      setForm({ ...form, isActive: e.target.checked })
                    }
                    disabled={isView}
                  />
                </div>

                <div className="col-span-2 flex justify-center gap-4 mt-6">
                  {!isView && (
                    <Button type="submit" variant="submit" disabled={loading}>
                      {loading ? "Saving..." : "Save"}
                    </Button>
                  )}

                  <Button
                    type="button"
                    variant="cancel"
                    onClick={() => navigate("/Menu_list")}
                  >
                    Cancel
                  </Button>
                </div>

              </form>
            </Card>
          </div>
        </div>

        <Footer />
      </main>
    </div>
  );
};

export default Menu_master;