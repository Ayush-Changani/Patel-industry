import React, { useEffect, useState, useRef } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import Swal from "sweetalert2";
import api from "../../../services/axios";

import Card from "../../../components/Card";
import Input from "../../../components/Input";
import Button from "../../../components/Button";
import Select from "../../../components/Select";
import Sidebar from "../../../components/Sidebar";
import Footer from "../../../components/Footer";
import Header from "../../../components/Header";

import {
  validateRequired,
  validateEmail,
  validateNumber,
  validatePattern,
} from "../../../utils/validationUtils";

// GST Regex for validation
const gstRegex = /^[0-9]{2}[A-Z]{5}[0-9]{4}[A-Z]{1}[1-9A-Z]{1}Z[0-9A-Z]{1}$/;

const Company_Master = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const query = new URLSearchParams(location.search);

  const editId = query.get("eid");
  const viewId = query.get("view_id");
  const isEdit = Boolean(editId);
  const isView = Boolean(viewId);
  const com_Id = editId || viewId || 0;

  const logoInputRef = useRef(null);

  const [form, setForm] = useState({
    comName: "",
    comPerson: "",
    comAddress: "",
    taluka: "",
    taluka_id: "",
    district: "",
    district_id: "",
    state: "",
    state_id: "",
    country: "",
    country_id: "",
    pincode: "",
    contactNumber: "",
    alternateNumber: "",
    email: "",
    website: "",
    gstNo: "",
    isActive: true,
  });

  const [city, setCity] = useState(null);
  const [cityOptions, setCityOptions] = useState([]);
  const [logoFile, setLogoFile] = useState(null);
  const [logoName, setLogoName] = useState("");
  const [logoPreview, setLogoPreview] = useState(null);
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});

  const fetchCities = async (search = "") => {
    try {
      const res = await api.get("/i_pi_get_all_city_ddl", {
        params: { SearchTerm: search || "" },
      });
      if (res.data?.Status === 1) {
        const options = res.data.Result.map((c) => ({
          value: String(c.cit_id),
          label: c.cit_name,
        }));
        setCityOptions(options);
        return options;
      }
      return [];
    } catch (err) {
      return [];
    }
  };

  useEffect(() => {
    const initializeData = async () => {
      setLoading(true);
      await fetchCities("");
      if (com_Id) {
        try {
          const res = await api.get("/i_pi_company_mst_select_all_and_id", {
            params: { com_id: parseInt(com_Id) },
          });
          if (res.data?.Status === 1 && res.data.Result?.length) {
            const d = res.data.Result[0];
            if (d.com_city) {
              const selectedCity = {
                value: String(d.com_city),
                label: d.city_name,
              };
              setCity(selectedCity);
              setCityOptions((prev) => {
                const exists = prev.find(
                  (opt) => opt.value === selectedCity.value
                );
                return exists ? prev : [selectedCity, ...prev];
              });
            }
            setForm({
              comName: d.company_name || "",
              comPerson: d.contact_person || "",
              comAddress: d.address || "",
              taluka: d.tal_name || "",
              taluka_id: d.com_taluka || "",
              district: d.dis_name || "",
              district_id: d.com_district || "",
              state: d.st_name || "",
              state_id: d.com_state || "",
              country: d.cu_name || "",
              country_id: d.com_country || "",
              pincode: d.pincode || "",
              contactNumber: d.contact_number || "",
              alternateNumber: d.alternate_number || "",
              email: d.email || "",
              website: d.website || "",
              gstNo: d.gst_number || "",
              isActive: d.com_status === 1,
            });
            if (d.com_upload_logo) setLogoName(d.com_upload_logo);
            if (d.full_logo_url) setLogoPreview(d.full_logo_url);
          }
        } catch (error) {
          Swal.fire("Error", "Failed to fetch company data", "error");
        }
      }
      setLoading(false);
    };
    initializeData();
  }, [com_Id]);

  useEffect(() => {
    if (!city?.value) {
      setForm((p) => ({
        ...p,
        taluka: "",
        district: "",
        state: "",
        country: "",
      }));
      return;
    }
    const fetchCityDetail = async () => {
      try {
        const res = await api.get("/i_pi_get_city_full_detail_by_id", {
          params: { cit_id: city.value },
        });
        if (res.data?.Status === 1 && res.data.Result?.length) {
          const d = res.data.Result[0];
          setForm((p) => ({
            ...p,
            taluka: d.tal_name,
            taluka_id: d.tal_id,
            district: d.dis_name,
            district_id: d.dis_id,
            state: d.st_name,
            state_id: d.st_id,
            country: d.cu_name,
            country_id: d.cu_id,
          }));
        }
      } catch (err) {
        console.error(err);
      }
    };
    fetchCityDetail();
  }, [city?.value]);

  const onChange = (e) => {
    if (isView) return;
    const { name, value } = e.target;

    // Always uppercase GST
    const updatedValue = name === "gstNo" ? value.toUpperCase() : value;

    setForm((prev) => ({
      ...prev,
      [name]: updatedValue,
    }));

    setErrors((prev) => {
      let newErrors = { ...prev };

      if (name === "gstNo") {
        if (!updatedValue) {
          newErrors.gstNo = { message: "GST No is required", color: "#F63049" };
        } else if (!gstRegex.test(updatedValue)) {
          newErrors.gstNo = {
            message: "Invalid GST format (e.g. 22AAAAA0000A1Z5)",
            color: "#F63049",
          };
        } else {
          delete newErrors.gstNo;
        }
      } else {
        if (newErrors[name]) delete newErrors[name];
      }

      return newErrors;
    });
  };

  const handleLogoChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setLogoFile(file);
      setLogoPreview(URL.createObjectURL(file));
      setErrors({ ...errors, logo: null });
    }
  };

  const validateForm = () => {
    const newErrors = {};

    newErrors.comName = validateRequired(form.comName, "Company Name");
    newErrors.comPerson = validateRequired(form.comPerson, "Contact Person");
    newErrors.city = city
      ? null
      : { message: "City is required", color: "#F63049" };

    newErrors.contactNumber = validateNumber(
      form.contactNumber,
      "Contact Number"
    );

    newErrors.email = validateEmail(form.email);

    newErrors.gstNo = validatePattern(
      form.gstNo,
      gstRegex,
      "Invalid GST format (e.g. 22AAAAA0000A1Z5)"
    );

    newErrors.website = validateRequired(form.website, "Website");

    if (!isEdit && !logoFile) {
      newErrors.logo = {
        message: "Company logo is required",
        color: "#F63049",
      };
    }

    setErrors(newErrors);
    return Object.values(newErrors).every((err) => !err?.message);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (isView || !validateForm()) return;
    setLoading(true);
    try {
      const fd = new FormData();
      fd.append("com_id", isEdit ? com_Id : 0);
      fd.append("com_name", form.comName);
      fd.append("com_person", form.comPerson);
      fd.append("com_address", form.comAddress);
      fd.append("com_city", city?.value || "");
      fd.append("com_taluka", form.taluka_id);
      fd.append("com_district", form.district_id);
      fd.append("com_state", form.state_id);
      fd.append("com_country", form.country_id);
      fd.append("com_pincode", form.pincode);
      fd.append("com_contact_number", form.contactNumber);
      fd.append("com_alternate_number", form.alternateNumber);
      fd.append("com_email", form.email);
      fd.append("com_website", form.website);
      fd.append("com_gst_no", form.gstNo);
      fd.append("com_status", form.isActive ? 1 : 0);

      if (logoFile) {
        fd.append("com_logo_file", logoFile);
      } else {
        fd.append("com_upload_logo", logoName);
      }

      const res = await api.post("/i_pi_company_detail_insert", fd);
      if (res.data?.Status === 1 || res.data?.status === 1) {
        Swal.fire("Success", res.data?.message || "Data Saved Successfully", "success");
        navigate("/Company_list");
      } else {
        Swal.fire("Error", res.data?.message || "Failed to save", "error");
      }
    } catch (err) {
      Swal.fire("Error", "Internal Server Error", "error");
    } finally {
      setLoading(false);
    }
  };

  const ErrorMsg = ({ name }) =>
    errors[name]?.message ? (
      <p style={{ color: errors[name].color || "#F63049" }} className="text-xxxs mt-1">
        {errors[name].message}
      </p>
    ) : null;

  return (
    <div className="flex h-screen overflow-hidden">
      <Sidebar />
      <main className="flex-1 ml-64 flex flex-col h-full overflow-hidden">
        <Header />
        <div className="flex-1 overflow-y-auto p-4 custom-scrollbar-sidebar">
          <div className="max-w-5xl mx-auto">
            <Card title="Company Master">
              <form
                onSubmit={handleSubmit}
                className="grid grid-cols-2 gap-x-6 gap-y-4 p-4"
              >
                <div>
                  <Input
                    label="Company Name"
                    name="comName"
                    required
                    value={form.comName}
                    onChange={onChange}
                    disabled={isView}
                  />
                  <ErrorMsg name="comName" />
                </div>

                <div>
                  <Input
                    label="Contact Person"
                    name="comPerson"
                    value={form.comPerson}
                    onChange={onChange}
                    disabled={isView}
                  />
                  <ErrorMsg name="comPerson" />
                </div>

                <div className="col-span-2">
                  <Input
                    label="Address"
                    name="comAddress"
                    value={form.comAddress}
                    onChange={onChange}
                    multiline
                    rows={2}
                    disabled={isView}
                  />
                </div>

                <div>
                  <Select
                    key={city ? `city-${city.value}` : "city-empty"}
                    label="City"
                    options={cityOptions}
                    value={city}
                    disabled={isView}
                    onChange={(val) => {
                      setCity(val);
                      setErrors({ ...errors, city: null });
                    }}
                    searchable
                    serverSearch
                    onSearch={fetchCities}
                    placeholder="Search City..."
                  />
                  <ErrorMsg name="city" />
                </div>

                <Input
                  label="Pincode"
                  name="pincode"
                  value={form.pincode}
                  onChange={onChange}
                  disabled={isView}
                />

                <Input label="Taluka" value={form.taluka} disabled />
                <Input label="District" value={form.district} disabled />
                <Input label="State" value={form.state} disabled />
                <Input label="Country" value={form.country} disabled />

                <div>
                  <Input
                    label="Contact Number"
                    type="number"
                    name="contactNumber"
                    value={form.contactNumber}
                    onChange={(e) => {
                      if (e.target.value.length <= 10) onChange(e);
                    }}
                    disabled={isView}
                  />
                  <ErrorMsg name="contactNumber" />
                </div>

                <Input
                  label="Alternate Number"
                  name="alternateNumber"
                  value={form.alternateNumber}
                  onChange={(e) => {
                    if (e.target.value.length <= 10) onChange(e);
                  }}
                  disabled={isView}
                />

                <div>
                  <Input
                    label="Email"
                    name="email"
                    value={form.email}
                    onChange={onChange}
                    disabled={isView}
                  />
                  <ErrorMsg name="email" />
                </div>

                <div>
                  <Input
                    label="Website"
                    name="website"
                    value={form.website}
                    onChange={onChange}
                    disabled={isView}
                  />
                  <ErrorMsg name="website" />
                </div>

                <div>
                  <Input
                    label="GST No"
                    name="gstNo"
                    value={form.gstNo}
                    onChange={onChange}
                    disabled={isView}
                  />
                  <ErrorMsg name="gstNo" />
                </div>

                <div className="col-span-2 mt-2">
                  <Input
                    type="file"
                    label="Company Logo"
                    name="com_logo_file"
                    ref={logoInputRef}
                    disabled={isView}
                    accept="image/*"
                    previewUrl={logoPreview}
                    onChange={handleLogoChange}
                  />
                  <ErrorMsg name="logo" />
                </div>

                <div>
                  <Input
                    type="checkbox"
                    id="status-check"
                    label="Active"
                    checked={form.isActive}
                    disabled={isView}
                    onChange={(e) =>
                      setForm({ ...form, isActive: e.target.checked })
                    }
                  />
                </div>

                <div className="col-span-2 flex justify-center gap-4 mt-8 pt-6">
                  {!isView && (
                    <Button type="submit" variant="submit" disabled={loading}>
                      {loading ? "Saving..." : "Save"}
                    </Button>
                  )}
                  <Button
                    type="button"
                    variant="cancel"
                    onClick={() => navigate("/Company_list")}
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

export default Company_Master;