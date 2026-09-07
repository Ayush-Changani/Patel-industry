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

// ✅ Added
import { validateRequired, validateNumber } from "../../../utils/validationUtils";

const Vendor_Customer_Master = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const query = new URLSearchParams(location.search);

  const editId = query.get("eid");
  const viewId = query.get("view_id");
  const isEdit = Boolean(editId);
  const isView = Boolean(viewId);
  const currentVcId = editId || viewId || 0;

  const [form, setForm] = useState({
    vendorName: "",
    address: "",
    gstNumber: "",
    contactPerson: "",
    contactNumber: "",
    isVendor: false,
    isCustomer: false,
  });

  const [entityGroup, setEntityGroup] = useState(null);
  const [groupOptions, setGroupOptions] = useState([]);
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({}); // ✅ Added

  // ✅ Added: ErrorMsg component
  const ErrorMsg = ({ name }) =>
    errors[name]?.message ? (
      <p style={{ color: errors[name].color || "#F63049" }} className="text-xxxs mt-1">
        {errors[name].message}
      </p>
    ) : null;

  const fetchGroups = async (search = "") => {
    try {
      const res = await api.get("/i_pi_get_all_entity_group_ddl", {
        params: { SearchTerm: search || "" },
      });
      if (res.data?.Status === 1) {
        const mapped = res.data.Result.map((g) => ({
          value: String(g.eg_id),
          label: g.eg_group,
        }));
        setGroupOptions(mapped);
        return mapped;
      }
      return [];
    } catch (err) {
      return [];
    }
  };

  useEffect(() => {
    const init = async () => {
      setLoading(true);
      const latestGroups = await fetchGroups("");

      if (currentVcId > 0) {
        try {
          const res = await api.get(
            "/i_pi_vendor_and_customer_cnt_select_all_and_id",
            { params: { vc_id: currentVcId } }
          );

          if (res.data?.Status === 1 && res.data.Result?.length) {
            const d = res.data.Result[0];
            setForm({
              vendorName: d.vendor_name || "",
              address: d.vendor_address || "",
              gstNumber: d.GST_number || "",
              contactPerson: d.contact_pertson || "",
              contactNumber: String(d.contact_number || ""),
              isVendor: d.is_vendor === 1,
              isCustomer: d.is_customer === 1,
            });

            if (d.vc_group_name) {
              const existingOption = latestGroups.find(
                (opt) => opt.value === String(d.vc_group_name)
              );
              if (existingOption) {
                setEntityGroup(existingOption);
              } else {
                setEntityGroup({
                  value: d.vc_group_name,
                  label: d.group_name || "Selected Group",
                });
              }
            }
          }
        } catch (err) {
          Swal.fire("Error", "Failed to load record details", "error");
        }
      }
      setLoading(false);
    };
    init();
  }, [currentVcId]);

  // ✅ Added: validateForm function
  const validateForm = () => {
    const newErrors = {};
    newErrors.entityGroup = entityGroup
      ? null
      : { message: "Entity Group is required", color: "#F63049" };
    newErrors.vendorName = validateRequired(form.vendorName, "Vendor/Customer Name");
    newErrors.contactNumber = form.contactNumber
      ? validateNumber(form.contactNumber, 10, "Contact Number")
      : validateRequired(form.contactNumber, "Contact Number");
    setErrors(newErrors);
    return Object.values(newErrors).every((err) => !err?.message);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (isView || !validateForm()) return; // ✅ Changed

    setLoading(true);
    try {
      const formData = new FormData();
      formData.append("vc_id", currentVcId);
      formData.append("vc_group_name", entityGroup?.value || 0);
      formData.append("vc_vendor_name", form.vendorName);
      formData.append("vc_vendor_address", form.address);
      formData.append("vc_gst_number", form.gstNumber);
      formData.append("vc_contact_parson", form.contactPerson);
      formData.append("vc_contact_number", form.contactNumber);
      formData.append("vc_is_vendor", form.isVendor ? 1 : 0);
      formData.append("vc_is_customer", form.isCustomer ? 1 : 0);

      const res = await api.post("/i_pi_vendor_and_customer_insert", formData);
      if (res.data?.Status === 1 || res.data?.status === 1) {
        Swal.fire("Success", res.data.message || "Saved successfully", "success");
        navigate("/Vendor_Customer_list");
      } else {
        Swal.fire("Warning", res.data.message || "Operation failed", "warning");
      }
    } catch (err) {
      Swal.fire("Error", "Server Error", "error");
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
            <Card title="Vendor Customer Master">
              <form onSubmit={handleSubmit} className="grid grid-cols-2 gap-4 p-2">

                {/* ✅ Wrapped in div, added ErrorMsg, clears on select */}
                <div>
                  <Select
                    label="Entity Group"
                    options={groupOptions}
                    value={entityGroup}
                    onChange={(val) => {
                      setEntityGroup(val);
                      setErrors({ ...errors, entityGroup: null });
                    }}
                    searchable
                    serverSearch
                    onSearch={fetchGroups}
                    placeholder="Select Group"
                    disabled={isView}
                  />
                  <ErrorMsg name="entityGroup" />
                </div>

                {/* ✅ Wrapped in div, added ErrorMsg, clears on change */}
                <div>
                  <Input
                    label="Vendor/Customer Name"
                    value={form.vendorName}
                    onChange={(e) => {
                      setForm({ ...form, vendorName: e.target.value });
                      if (errors.vendorName) setErrors({ ...errors, vendorName: null });
                    }}
                    required
                    disabled={isView}
                  />
                  <ErrorMsg name="vendorName" />
                </div>

                {/* Address — not required, no ErrorMsg needed */}
                <div className="col-span-2">
                  <Input
                    label="Address"
                    value={form.address}
                    onChange={(e) => setForm({ ...form, address: e.target.value })}
                    disabled={isView}
                  />
                </div>

                {/* GST — not required, no ErrorMsg needed */}
                <Input
                  label="GST Number"
                  value={form.gstNumber}
                  onChange={(e) => {
                    if (e.target.value.length <= 15)
                      setForm({ ...form, gstNumber: e.target.value.toUpperCase() });
                  }}
                  disabled={isView}
                />

                {/* Contact Person — not required, no ErrorMsg needed */}
                <Input
                  label="Contact Person"
                  value={form.contactPerson}
                  onChange={(e) => setForm({ ...form, contactPerson: e.target.value })}
                  disabled={isView}
                />

                {/* ✅ Wrapped in div, added ErrorMsg, clears on change */}
                <div>
                  <Input
                    label="Contact Number"
                    type="number"
                    value={form.contactNumber}
                    onChange={(e) => {
                      if (e.target.value.length <= 10) {
                        setForm({ ...form, contactNumber: e.target.value });
                        if (errors.contactNumber)
                          setErrors({ ...errors, contactNumber: null });
                      }
                    }}
                    required
                    disabled={isView}
                  />
                  <ErrorMsg name="contactNumber" />
                </div>

                <div className="flex items-center gap-6 mt-4">
                  <Input
                    type="checkbox"
                    label="Is Vendor?"
                    checked={form.isVendor}
                    onChange={(e) => setForm({ ...form, isVendor: e.target.checked })}
                    disabled={isView}
                  />
                  <Input
                    type="checkbox"
                    label="Is Customer?"
                    checked={form.isCustomer}
                    onChange={(e) => setForm({ ...form, isCustomer: e.target.checked })}
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
                    onClick={() => navigate("/Vendor_Customer_list")}
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

export default Vendor_Customer_Master;