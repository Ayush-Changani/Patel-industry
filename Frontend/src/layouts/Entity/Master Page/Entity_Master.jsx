import React, { useState, useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import Swal from "sweetalert2";
import api from "../../../services/axios";

import Card from "../../../components/Card";
import Input from "../../../components/Input";
import Button from "../../../components/Button";
import Sidebar from "../../../components/Sidebar"
import Header from "../../../components/Header";;
import Footer from "../../../components/Footer";
import Select from "../../../components/Select";

import { validateRequired } from "../../../utils/validationUtils";

const Entity_Master = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const query = new URLSearchParams(location.search);

  const editId = query.get("eid");
  const viewId = query.get("view_id");
  const isEdit = Boolean(editId);
  const isView = Boolean(viewId);
  const currentEntId = editId || viewId || 0;

  const [form, setForm] = useState({
    entName: "",
    entCode: "",
    isActive: true,
  });

  const [entityGroup, setEntityGroup] = useState(null);
  const [entityGroupOptions, setEntityGroupOptions] = useState([]);
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});

  const ErrorMsg = ({ name }) =>
    errors[name]?.message ? (
      <p style={{ color: errors[name].color || "#F63049" }} className="text-xxxs mt-1">
        {errors[name].message}
      </p>
    ) : null;

  /* ═══════════════════════════════════════════
     FETCH: Entity Group DDL
  ═══════════════════════════════════════════ */
  const fetchEntityGroups = async (search = "") => {
    try {
      const res = await api.get("/i_pi_get_all_entity_group_ddl", {
        params: { SearchTerm: search || "" },
      });
      if (res.data?.Status === 1) {
        const mapped = res.data.Result.map((g) => ({
          value: g.eg_id,
          label: g.eg_group,
        }));
        setEntityGroupOptions(mapped);
        return mapped;
      }
      return [];
    } catch (err) {
      console.error(err);
      return [];
    }
  };

  /* ═══════════════════════════════════════════
     FETCH: Edit / View Data
  ═══════════════════════════════════════════ */
  useEffect(() => {
    const init = async () => {
      setLoading(true);
      await fetchEntityGroups("");

      if (currentEntId > 0) {
        try {
          const res = await api.get("/i_pi_entity_mst_select_all_and_id", {
            params: { ent_id: currentEntId },
          });
          if (res.data?.Status === 1 && res.data.Result?.length) {
            const d = res.data.Result[0];
            setForm({
              entName: d.ent_name   || "",
              entCode: d.ent_code   || "",
              isActive: d.ent_is_active === 1,
            });
            if (d.ent_eg_id) {
              const selected = {
                value: d.ent_eg_id,
                label: d.entity_group_name,
              };
              setEntityGroup(selected);
              setEntityGroupOptions((prev) => {
                const exists = prev.find((o) => o.value === selected.value);
                return exists ? prev : [selected, ...prev];
              });
            }
          }
        } catch (err) {
          Swal.fire("Error", "Failed to load entity data", "error");
        }
      }
      setLoading(false);
    };
    init();
  }, [currentEntId]);

  /* ═══════════════════════════════════════════
     VALIDATION
  ═══════════════════════════════════════════ */
  const validateForm = () => {
    const newErrors = {};
    newErrors.entName = validateRequired(form.entName, "Entity Name");
    newErrors.entCode = validateRequired(form.entCode, "Entity Code");
    newErrors.entityGroup = entityGroup
      ? null
      : { message: "Entity Group is required", color: "#F63049" };
    setErrors(newErrors);
    return Object.values(newErrors).every((err) => !err?.message);
  };

  /* ═══════════════════════════════════════════
     SUBMIT
  ═══════════════════════════════════════════ */
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (isView || !validateForm()) return;

    setLoading(true);
    try {
      const formData = new FormData();
      formData.append("ent_id",        currentEntId);
      formData.append("ent_eg_id",     entityGroup.value);
      formData.append("ent_name",      form.entName);
      formData.append("ent_code",      form.entCode);
      formData.append("ent_is_active", form.isActive ? 1 : 0);

      const res = await api.post("/i_pi_entity_mst_insert", formData);
      if (res.data?.Status === 1 || res.data?.status === 1) {
        Swal.fire("Success", res.data.message || "Saved successfully", "success");
        navigate("/Entity_list");
      } else {
        Swal.fire("Warning", res.data.message || "Operation failed", "warning");
      }
    } catch (err) {
      Swal.fire("Error", "Server Error", "error");
    } finally {
      setLoading(false);
    }
  };

  /* ═══════════════════════════════════════════
     RENDER
  ═══════════════════════════════════════════ */
  return (
    <div className="flex h-screen overflow-hidden">
      <Sidebar />
      <main className="flex-1 ml-30 flex flex-col overflow-hidden">
        <Header />
        <div className="flex-1 overflow-y-auto p-4 custom-scrollbar-sidebar">
          <div className="max-w-5xl mx-auto">
            <Card title="Entity Master">
              <form onSubmit={handleSubmit} className="grid grid-cols-2 gap-4 p-2">

                {/* Entity Name */}
                <div>
                  <Input
                    label="Entity Name"
                    placeholder="Enter entity name"
                    value={form.entName}
                    onChange={(e) => {
                      setForm({ ...form, entName: e.target.value });
                      if (errors.entName) setErrors({ ...errors, entName: null });
                    }}
                    required
                    disabled={isView}
                  />
                  <ErrorMsg name="entName" />
                </div>

                {/* Entity Code */}
                <div>
                  <Input
                    label="Entity Code"
                    placeholder="Enter entity code"
                    value={form.entCode}
                    onChange={(e) => {
                      setForm({ ...form, entCode: e.target.value });
                      if (errors.entCode) setErrors({ ...errors, entCode: null });
                    }}
                    required
                    disabled={isView}
                  />
                  <ErrorMsg name="entCode" />
                </div>

                {/* Entity Group */}
                <div>
                  <Select
                    label="Entity Group"
                    options={entityGroupOptions}
                    value={entityGroup}
                    onChange={(val) => {
                      setEntityGroup(val);
                      setErrors({ ...errors, entityGroup: null });
                    }}
                    searchable
                    serverSearch
                    onSearch={fetchEntityGroups}
                    placeholder="Search entity group..."
                    required
                    disabled={isView}
                  />
                  <ErrorMsg name="entityGroup" />
                </div>

                {/* Active */}
                <div className="flex items-center gap-6 mt-4">
                  <Input
                    type="checkbox"
                    label="Active"
                    id="isActive"
                    checked={form.isActive}
                    onChange={(e) => setForm({ ...form, isActive: e.target.checked })}
                    disabled={isView}
                  />
                </div>

                {/* Buttons */}
                <div className="col-span-2 flex justify-center gap-4 mt-6">
                  {!isView && (
                    <Button type="submit" variant="submit" disabled={loading}>
                      {loading ? "Saving..." : "Save"}
                    </Button>
                  )}
                  <Button type="button" variant="cancel" onClick={() => navigate("/Entity_list")}>
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

export default Entity_Master;