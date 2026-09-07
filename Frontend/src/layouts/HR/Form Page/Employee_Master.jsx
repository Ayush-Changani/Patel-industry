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

const panRegex    = /^[A-Z]{5}[0-9]{4}[A-Z]{1}$/;
const ifscRegex   = /^[A-Z]{4}0[A-Z0-9]{6}$/;
const aadharRegex = /^\d{12}$/;

const TABS = ["Personal Info", "Job Details", "Documents", "Bank Details"];

const Employee_Master = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const query   = new URLSearchParams(location.search);

  const editId = query.get("eid");
  const viewId = query.get("view_id");
  const isEdit = Boolean(editId);
  const isView = Boolean(viewId);
  const emp_Id = editId || viewId || 0;

  const photoRef       = useRef(null);
  const docAadharRef   = useRef(null);
  const docPanRef      = useRef(null);
  const docOfferRef    = useRef(null);
  const docExpRef      = useRef(null);
  const docEduRef      = useRef(null);
  const docOtherRef    = useRef(null);

  const [activeTab, setActiveTab] = useState(0);
  const [loading, setLoading]     = useState(false);
  const [errors, setErrors]       = useState({});

  // ── Form state ─────────────────────────────────────────────────────────────
  const [form, setForm] = useState({
    empCode: "",
    firstName: "", lastName: "",
    dob: "", gender: "", bloodGroup: "", maritalStatus: "",
    mobile: "", alternateMobile: "", personalEmail: "",
    aadhar: "", pan: "",
    address: "", pincode: "",
    taluka: "", talukaId: "",
    district: "", districtId: "",
    state: "", stateId: "",
    country: "", countryId: "",
    // Job
    doj: "", empType: "", workLocation: "", shift: "",
    workEmail: "", probationMonths: "", confirmationDate: "", ctc: "",
    // Documents existing names (for edit)
    docAadharExisting: "", docPanExisting: "", docOfferExisting: "",
    docExpExisting: "", docEduExisting: "", docOtherExisting: "",
    docOtherLabel: "",
    // Bank
    bankName: "", accountNumber: "", confirmAccountNumber: "",
    ifscCode: "", accountType: "", branchName: "", upiId: "",
    // Status
    isActive: true,
  });

  // ── File states with improved structure ─────────────────────────────────────
  const [photoFile,    setPhotoFile]    = useState(null);
  const [photoPreview, setPhotoPreview] = useState(null);
  const [photoName,    setPhotoName]    = useState("");
  
  const [docAadharFile,   setDocAadharFile]   = useState(null);
  const [docAadharPreview, setDocAadharPreview] = useState(null);
  const [docAadharName,    setDocAadharName]    = useState("");

  const [docPanFile,      setDocPanFile]      = useState(null);
  const [docPanPreview,    setDocPanPreview]    = useState(null);
  const [docPanName,       setDocPanName]       = useState("");

  const [docOfferFile,    setDocOfferFile]    = useState(null);
  const [docOfferPreview,  setDocOfferPreview]  = useState(null);
  const [docOfferName,     setDocOfferName]     = useState("");

  const [docExpFile,      setDocExpFile]      = useState(null);
  const [docExpPreview,    setDocExpPreview]    = useState(null);
  const [docExpName,       setDocExpName]       = useState("");

  const [docEduFile,      setDocEduFile]      = useState(null);
  const [docEduPreview,    setDocEduPreview]    = useState(null);
  const [docEduName,       setDocEduName]       = useState("");

  const [docOtherFile,    setDocOtherFile]    = useState(null);
  const [docOtherPreview,  setDocOtherPreview]  = useState(null);
  const [docOtherName,     setDocOtherName]     = useState("");

  // ── Dropdowns ──────────────────────────────────────────────────────────────
  const [city, setCity]                           = useState(null);
  const [cityOptions, setCityOptions]             = useState([]);
  const [department, setDepartment]               = useState(null);
  const [departmentOptions, setDepartmentOptions] = useState([]);
  const [designation, setDesignation]             = useState(null);
  const [designationOptions, setDesignationOptions] = useState([]);
  const [manager, setManager]                     = useState(null);
  const [managerOptions, setManagerOptions]       = useState([]);

  const [genderOption,        setGenderOption]        = useState(null);
  const [bloodGroupOption,    setBloodGroupOption]     = useState(null);
  const [maritalOption,       setMaritalOption]        = useState(null);
  const [empTypeOption,       setEmpTypeOption]        = useState(null);
  const [shiftOption,         setShiftOption]          = useState(null);
  const [accountTypeOption,   setAccountTypeOption]    = useState(null);

  const genderOptions      = [{ value:"Male",label:"Male"},{ value:"Female",label:"Female"},{ value:"Other",label:"Other"}];
  const bloodGroupOptions  = ["A+","A-","B+","B-","O+","O-","AB+","AB-"].map(v=>({value:v,label:v}));
  const maritalOptions     = ["Single","Married","Divorced","Widowed"].map(v=>({value:v,label:v}));
  const empTypeOptions     = ["Full-Time","Part-Time","Contract","Intern"].map(v=>({value:v,label:v}));
  const shiftOptions       = ["Morning","Evening","Night","General"].map(v=>({value:v,label:v}));
  const accountTypeOptions = ["Savings","Current"].map(v=>({value:v,label:v}));

  // ── API fetchers ───────────────────────────────────────────────────────────
  const fetchCities = async (search = "") => {
    try {
      const res = await api.get("/i_pi_get_all_city_ddl", { params: { SearchTerm: search } });
      if (res.data?.Status === 1) {
        const opts = res.data.Result.map(c => ({ value: String(c.cit_id), label: c.cit_name }));
        setCityOptions(opts); return opts;
      }
    } catch { return []; }
  };

  const fetchDepartments = async (search = "") => {
    try {
      const res = await api.get("/i_pi_get_all_department_ddl", { params: { SearchTerm: search } });
      if (res.data?.Status === 1) {
        const opts = res.data.Result.map(d => ({ value: String(d.dept_id), label: d.dept_name }));
        setDepartmentOptions(opts); return opts;
      }
    } catch { return []; }
  };

  const fetchDesignations = async (search = "", deptId = 0) => {
    try {
      const res = await api.get("/i_pi_get_all_designation_ddl", { params: { SearchTerm: search, dept_id: deptId } });
      if (res.data?.Status === 1) {
        const opts = res.data.Result.map(d => ({ value: String(d.des_id), label: d.des_name }));
        setDesignationOptions(opts); return opts;
      }
      setDesignationOptions([]); return [];
    } catch { return []; }
  };

  const fetchManagers = async (search = "") => {
    try {
      const excludeId = isEdit ? parseInt(emp_Id) : 0;
      const res = await api.get("/i_pi_get_all_employee_ddl", { params: { SearchTerm: search, exclude_emp_id: excludeId } });
      if (res.data?.Status === 1) {
        const opts = res.data.Result.map(e => ({ value: String(e.emp_id), label: `${e.emp_full_name} (${e.emp_code})` }));
        setManagerOptions(opts); return opts;
      }
    } catch { return []; }
  };

  const fetchNextCode = async () => {
    try {
      const res = await api.get("/i_pi_get_next_employee_code");
      if (res.data?.Status === 1) setForm(p => ({ ...p, empCode: res.data.Result }));
    } catch {}
  };

  // ── City auto-fill ─────────────────────────────────────────────────────────
  useEffect(() => {
    if (!city?.value) {
      setForm(p => ({ ...p, taluka:"", talukaId:"", district:"", districtId:"", state:"", stateId:"", country:"", countryId:"" }));
      return;
    }
    const fetchDetail = async () => {
      try {
        const res = await api.get("/i_pi_get_city_full_detail_by_id", { params: { cit_id: city.value } });
        if (res.data?.Status === 1 && res.data.Result?.length) {
          const d = res.data.Result[0];
          setForm(p => ({ ...p, taluka: d.tal_name, talukaId: d.tal_id, district: d.dis_name, districtId: d.dis_id, state: d.st_name, stateId: d.st_id, country: d.cu_name, countryId: d.cu_id }));
        }
      } catch {}
    };
    fetchDetail();
  }, [city?.value]);

  // ── Confirmation date auto-calc ────────────────────────────────────────────
  useEffect(() => {
    if (form.doj && form.probationMonths && parseInt(form.probationMonths) > 0) {
      const d = new Date(form.doj);
      d.setMonth(d.getMonth() + parseInt(form.probationMonths));
      setForm(p => ({ ...p, confirmationDate: d.toISOString().split("T")[0] }));
    }
  }, [form.doj, form.probationMonths]);

  // ── Init ───────────────────────────────────────────────────────────────────
  useEffect(() => {
    const init = async () => {
      setLoading(true);
      await Promise.all([fetchCities(""), fetchDepartments(""), fetchManagers("")]);

      if (emp_Id) {
        try {
          const res = await api.get("/i_pi_employee_mst_select_all_and_id", { params: { emp_id: parseInt(emp_Id) } });
          if (res.data?.Status === 1 && res.data.Result?.length) {
            const d = res.data.Result[0];

            // City
            if (d.emp_city) {
              const sel = { value: String(d.emp_city), label: d.city_name };
              setCity(sel);
              setCityOptions(prev => prev.find(o => o.value === sel.value) ? prev : [sel, ...prev]);
            }

            // Department
            if (d.emp_department_id) {
              const sel = { value: String(d.emp_department_id), label: d.department_name };
              setDepartment(sel);
              setDepartmentOptions(prev => prev.find(o => o.value === sel.value) ? prev : [sel, ...prev]);
              await fetchDesignations("", d.emp_department_id);
            }

            // Designation
            if (d.emp_designation_id) {
              const sel = { value: String(d.emp_designation_id), label: d.designation_name };
              setDesignation(sel);
              setDesignationOptions(prev => prev.find(o => o.value === sel.value) ? prev : [sel, ...prev]);
            }

            // Manager
            if (d.emp_reporting_manager_id) {
              const sel = { value: String(d.emp_reporting_manager_id), label: d.reporting_manager_name };
              setManager(sel);
              setManagerOptions(prev => prev.find(o => o.value === sel.value) ? prev : [sel, ...prev]);
            }

            // Static selects — use correct API field names
            if (d.gender)                  setGenderOption(genderOptions.find(o => o.value === d.gender) || null);
            if (d.blood_group)             setBloodGroupOption(bloodGroupOptions.find(o => o.value === d.blood_group) || null);
            if (d.matital_status)          setMaritalOption(maritalOptions.find(o => o.value === d.matital_status) || null);
            if (d.employee_type)           setEmpTypeOption(empTypeOptions.find(o => o.value === d.employee_type) || null);
            if (d.employee_shift)          setShiftOption(shiftOptions.find(o => o.value === d.employee_shift) || null);
            if (d.employee_account_type)   setAccountTypeOption(accountTypeOptions.find(o => o.value === d.employee_account_type) || null);

            // Photo
            if (d.emp_photo_url) {
              setPhotoPreview(d.emp_photo_url);
              setPhotoName(d.emp_photo || "");
            }

            // Documents
            if (d.emp_doc_aadhar) {
              setDocAadharPreview(d.emp_doc_aadhar_url || null);
              setDocAadharName(d.emp_doc_aadhar);
            }
            if (d.emp_doc_pan) {
              setDocPanPreview(d.emp_doc_pan_url || null);
              setDocPanName(d.emp_doc_pan);
            }
            if (d.emp_doc_offer) {
              setDocOfferPreview(d.emp_doc_offer_url || null);
              setDocOfferName(d.emp_doc_offer);
            }
            if (d.emp_doc_experience) {
              setDocExpPreview(d.emp_doc_experience_url || null);
              setDocExpName(d.emp_doc_experience);
            }
            if (d.emp_doc_education) {
              setDocEduPreview(d.emp_doc_education_url || null);
              setDocEduName(d.emp_doc_education);
            }
            if (d.emp_doc_other) {
              setDocOtherPreview(d.emp_doc_other_url || null);
              setDocOtherName(d.emp_doc_other);
            }

            // Helper: convert DD/MM/YYYY → YYYY-MM-DD for date inputs
            const toISODate = (str) => {
              if (!str) return "";
              const parts = str.split("/");
              if (parts.length === 3) return `${parts[2]}-${parts[1]}-${parts[0]}`;
              return str;
            };

            setForm({
              empCode:            d.employee_code             || "",
              firstName:          d.first_name                || "",
              lastName:           d.last_name                 || "",
              dob:                toISODate(d.date_of_birth),
              gender:             d.gender                    || "",
              bloodGroup:         d.blood_group               || "",
              maritalStatus:      d.matital_status            || "",
              mobile:             d.mobile                    || "",
              alternateMobile:    d.alternate_mobile          || "",
              personalEmail:      d.personal_email            || "",
              aadhar:             d.aadhar                    || "",
              pan:                d.employee_pan              || "",
              address:            d.employee_address          || "",
              pincode:            d.pincode                   || "",
              taluka:             d.taluka_name               || "",
              talukaId:           d.emp_taluka                || "",
              district:           d.district_name             || "",
              districtId:         d.emp_district              || "",
              state:              d.state_name                || "",
              stateId:            d.emp_state                 || "",
              country:            d.country_name              || "",
              countryId:          d.emp_country               || "",
              doj:                toISODate(d.date_of_joining),
              empType:            d.employee_type             || "",
              workLocation:       d.employee_work_location    || "",
              shift:              d.employee_shift            || "",
              workEmail:          d.employee_work_email       || "",
              probationMonths:    d.employee_probation_month  || "",
              confirmationDate:   toISODate(d.confirmation_date),
              ctc:                d.employee_ctc              || "",
              docAadharExisting:  "", 
              docPanExisting:     "", 
              docOfferExisting:   "", 
              docExpExisting:     "", 
              docEduExisting:     "", 
              docOtherExisting:   "", 
              docOtherLabel:      d.emp_doc_other_label       || "",
              bankName:           d.bank_name                 || "",
              accountNumber:      d.employee_account_number   || "",
              confirmAccountNumber: d.employee_account_number || "",
              ifscCode:           d.employee_ifsc_code        || "",
              accountType:        d.employee_account_type     || "",
              branchName:         d.employee_branch_name      || "",
              upiId:              d.employee_upi_id           || "",
              isActive:           d.emp_status                === 1,
            });
          }
        } catch { Swal.fire("Error", "Failed to fetch employee data", "error"); }
      } else {
        await fetchNextCode();
      }
      setLoading(false);
    };
    init();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [emp_Id]);

  // ── onChange ───────────────────────────────────────────────────────────────
  const onChange = (e) => {
    if (isView) return;
    const { name, value } = e.target;
    const upper = ["pan", "ifscCode"];
    setForm(p => ({ ...p, [name]: upper.includes(name) ? value.toUpperCase() : value }));
    setErrors(p => { const n = { ...p }; delete n[name]; return n; });
  };

  // ── File handlers ──────────────────────────────────────────────────────────
  const handlePhotoChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setPhotoFile(file);
      setPhotoPreview(URL.createObjectURL(file));
      setErrors({ ...errors, photo: null });
    }
  };

  const handleDocAadharChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setDocAadharFile(file);
      setDocAadharPreview(URL.createObjectURL(file));
      setErrors({ ...errors, docAadhar: null });
    }
  };

  const handleDocPanChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setDocPanFile(file);
      setDocPanPreview(URL.createObjectURL(file));
      setErrors({ ...errors, docPan: null });
    }
  };

  const handleDocOfferChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setDocOfferFile(file);
      setDocOfferPreview(URL.createObjectURL(file));
      setErrors({ ...errors, docOffer: null });
    }
  };

  const handleDocExpChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setDocExpFile(file);
      setDocExpPreview(URL.createObjectURL(file));
      setErrors({ ...errors, docExp: null });
    }
  };

  const handleDocEduChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setDocEduFile(file);
      setDocEduPreview(URL.createObjectURL(file));
      setErrors({ ...errors, docEdu: null });
    }
  };

  const handleDocOtherChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setDocOtherFile(file);
      setDocOtherPreview(URL.createObjectURL(file));
      setErrors({ ...errors, docOther: null });
    }
  };

  // ── Validation ─────────────────────────────────────────────────────────────
  const validateTab = (tabIndex) => {
    const e = {};
    if (tabIndex === 0) {
      e.firstName  = validateRequired(form.firstName, "First Name");
      e.lastName   = validateRequired(form.lastName,  "Last Name");
      e.mobile     = validateNumber(form.mobile, "Mobile Number");
      if (form.mobile && form.mobile.length !== 10)
        e.mobile = { message: "Mobile Number must be 10 digits", color: "#F63049" };
      e.gender     = genderOption ? "" : { message: "Gender is required", color: "#F63049" };
      e.aadhar     = validateRequired(form.aadhar, "Aadhaar Number");
      if (form.aadhar && !aadharRegex.test(form.aadhar))
        e.aadhar = { message: "Aadhaar must be 12 digits", color: "#F63049" };
      if (form.pan && !panRegex.test(form.pan))
        e.pan = { message: "Invalid PAN format (e.g. ABCDE1234F)", color: "#F63049" };
    }

    if (tabIndex === 1) {
      e.doj        = validateRequired(form.doj, "Date of Joining");
      e.empType    = empTypeOption ? "" : { message: "Employee Type is required", color: "#F63049" };
      e.department = department    ? "" : { message: "Department is required",    color: "#F63049" };
      e.designation= designation   ? "" : { message: "Designation is required",   color: "#F63049" };
      if (form.workEmail) {
        const emailErr = validateEmail(form.workEmail);
        if (emailErr.message) e.workEmail = emailErr;
      }
    }

    if (tabIndex === 3) {
      if (form.ifscCode && !ifscRegex.test(form.ifscCode))
        e.ifscCode = { message: "Invalid IFSC format (e.g. SBIN0001234)", color: "#F63049" };
      if (form.accountNumber && form.confirmAccountNumber && form.accountNumber !== form.confirmAccountNumber)
        e.confirmAccountNumber = { message: "Account numbers do not match", color: "#F63049" };
    }

    setErrors(e);
    return !Object.values(e).some(v => v?.message);
  };

  const validateForm = () => {
    let isValid = true;
    for (let i = 0; i < TABS.length; i++) {
      if (!validateTab(i)) {
        setActiveTab(i);
        isValid = false;
        break;
      }
    }
    return isValid;
  };

  // ── Submit ─────────────────────────────────────────────────────────────────
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (isView || !validateForm()) return;
    setLoading(true);
    try {
      const fd = new FormData();
      fd.append("emp_id",                   isEdit ? emp_Id : 0);
      fd.append("emp_code",                 form.empCode);
      fd.append("emp_first_name",           form.firstName);
      fd.append("emp_last_name",            form.lastName);
      fd.append("emp_dob",                  form.dob);
      fd.append("emp_gender",               genderOption?.value      || "");
      fd.append("emp_blood_group",          bloodGroupOption?.value  || "");
      fd.append("emp_marital_status",       maritalOption?.value     || "");
      fd.append("emp_mobile",               form.mobile);
      fd.append("emp_alternate_mobile",     form.alternateMobile);
      fd.append("emp_personal_email",       form.personalEmail);
      fd.append("emp_aadhar",               form.aadhar);
      fd.append("emp_pan",                  form.pan);
      fd.append("emp_address",              form.address);
      fd.append("emp_city",                 city?.value              || "");
      fd.append("emp_taluka",               form.talukaId            || "");
      fd.append("emp_district",             form.districtId          || "");
      fd.append("emp_state",                form.stateId             || "");
      fd.append("emp_country",              form.countryId           || "");
      fd.append("emp_pincode",              form.pincode);
      fd.append("emp_doj",                  form.doj);
      fd.append("emp_type",                 empTypeOption?.value     || "");
      fd.append("emp_department_id",        department?.value        || "");
      fd.append("emp_designation_id",       designation?.value       || "");
      fd.append("emp_reporting_manager_id", manager?.value           || "");
      fd.append("emp_work_location",        form.workLocation);
      fd.append("emp_shift",                shiftOption?.value       || "");
      fd.append("emp_work_email",           form.workEmail);
      fd.append("emp_probation_months",     form.probationMonths     || 0);
      fd.append("emp_confirmation_date",    form.confirmationDate);
      fd.append("emp_ctc",                  form.ctc                 || 0);
      // Documents
      fd.append("emp_doc_other_label",      form.docOtherLabel);
      // Bank
      fd.append("emp_bank_name",            form.bankName);
      fd.append("emp_account_number",       form.accountNumber);
      fd.append("emp_ifsc_code",            form.ifscCode);
      fd.append("emp_account_type",         accountTypeOption?.value || "");
      fd.append("emp_branch_name",          form.branchName);
      fd.append("emp_upi_id",               form.upiId);
      fd.append("emp_status",               form.isActive ? 1 : 0);
      
      // Files - Only append if new file is selected, otherwise append existing name
      if (photoFile) {
        fd.append("emp_photo_file", photoFile);
      } else {
        fd.append("emp_photo", photoName);
      }

      if (docAadharFile) {
        fd.append("emp_doc_aadhar_file", docAadharFile);
      } else {
        fd.append("emp_doc_aadhar", docAadharName);
      }

      if (docPanFile) {
        fd.append("emp_doc_pan_file", docPanFile);
      } else {
        fd.append("emp_doc_pan", docPanName);
      }

      if (docOfferFile) {
        fd.append("emp_doc_offer_file", docOfferFile);
      } else {
        fd.append("emp_doc_offer", docOfferName);
      }

      if (docExpFile) {
        fd.append("emp_doc_experience_file", docExpFile);
      } else {
        fd.append("emp_doc_experience", docExpName);
      }

      if (docEduFile) {
        fd.append("emp_doc_education_file", docEduFile);
      } else {
        fd.append("emp_doc_education", docEduName);
      }

      if (docOtherFile) {
        fd.append("emp_doc_other_file", docOtherFile);
      } else {
        fd.append("emp_doc_other", docOtherName);
      }

      const res = await api.post("/i_pi_employee_mst_detail_insert", fd, {
        headers: { "Content-Type": "multipart/form-data" },
      });

      if (res.data?.Status === 1 || res.data?.status === 1) {
        Swal.fire("Success", res.data?.message || "Employee saved successfully", "success");
        navigate("/Employee_list");
      } else {
        Swal.fire("Error", res.data?.message || "Failed to save", "error");
      }
    } catch {
      Swal.fire("Error", "Internal Server Error", "error");
    } finally {
      setLoading(false);
    }
  };

  // ── Helpers ────────────────────────────────────────────────────────────────
  const ErrorMsg = ({ name }) =>
    errors[name]?.message ? (
      <p style={{ color: errors[name].color || "#F63049" }} className="text-xxxs mt-1">
        {errors[name].message}
      </p>
    ) : null;

  // ── Render ─────────────────────────────────────────────────────────────────
  return (
    <div className="flex h-screen overflow-hidden">
      <Sidebar />
      <main className="flex-1 ml-64 flex flex-col h-full overflow-hidden">
        <Header />
        <div className="flex-1 overflow-y-auto p-4 custom-scrollbar-sidebar">
          <div className="max-w-5xl mx-auto">
            <Card title="Employee Master">
              {/* ── Tab bar ── */}
              <div className="flex border-b border-gray-200 px-4 pt-2">
                {TABS.map((t, i) => (
                  <button
                    key={t} type="button"
                    onClick={() => setActiveTab(i)}
                    className={`px-4 py-2 text-sm font-medium border-b-2 transition-colors mr-1
                      ${activeTab === i
                        ? "border-blue-600 text-blue-600"
                        : "border-transparent text-gray-500 hover:text-gray-700"}`}
                  >
                    {t}
                  </button>
                ))}
              </div>

              <form onSubmit={handleSubmit}>

                {/* ══════════════════════════════════════════════
                    TAB 0 — PERSONAL INFO
                ══════════════════════════════════════════════ */}
                {activeTab === 0 && (
                  <div className="grid grid-cols-2 gap-x-6 gap-y-4 p-4">

                    {/* Employee Code */}
                    <div>
                      <Input label="Employee ID" name="empCode" value={form.empCode} disabled placeholder="Auto-generated" />
                    </div>

                    {/* Photo upload */}
                    <div className="col-span-1 flex flex-col items-center gap-3">
                      <Input
                        type="file"
                        label="Employee Photo"
                        name="emp_photo_file"
                        ref={photoRef}
                        disabled={isView}
                        accept="image/*"
                        previewUrl={photoPreview}
                        onChange={handlePhotoChange}
                      />
                      <ErrorMsg name="photo" />
                    </div>

                    {/* Name */}
                    <div>
                      <Input label="First Name" name="firstName" required value={form.firstName} onChange={onChange} disabled={isView} />
                      <ErrorMsg name="firstName" />
                    </div>
                    <div>
                      <Input label="Last Name" name="lastName" required value={form.lastName} onChange={onChange} disabled={isView} />
                      <ErrorMsg name="lastName" />
                    </div>

                    {/* DOB + Gender */}
                    <div>
                      <Input label="Date of Birth" name="dob" type="date" value={form.dob} onChange={onChange} disabled={isView} />
                    </div>
                    <div>
                      <Select label="Gender" options={genderOptions} value={genderOption} disabled={isView} required
                        onChange={v => { setGenderOption(v); setErrors(p => { const n={...p}; delete n.gender; return n; }); }}
                        placeholder="Select gender..." />
                      <ErrorMsg name="gender" />
                    </div>

                    {/* Blood group + Marital */}
                    <div>
                      <Select label="Blood Group" options={bloodGroupOptions} value={bloodGroupOption} disabled={isView}
                        onChange={v => setBloodGroupOption(v)} placeholder="Select blood group..." />
                    </div>
                    <div>
                      <Select label="Marital Status" options={maritalOptions} value={maritalOption} disabled={isView}
                        onChange={v => setMaritalOption(v)} placeholder="Select status..." />
                    </div>

                    {/* Contact */}
                    <div>
                      <Input label="Mobile Number" name="mobile" type="number" required value={form.mobile}
                        onChange={e => { if (e.target.value.length <= 10) onChange(e); }} disabled={isView} />
                      <ErrorMsg name="mobile" />
                    </div>
                    <div>
                      <Input label="Alternate Number" name="alternateMobile" type="number" value={form.alternateMobile}
                        onChange={e => { if (e.target.value.length <= 10) onChange(e); }} disabled={isView} />
                    </div>
                    <div className="col-span-2">
                      <Input label="Personal Email" name="personalEmail" value={form.personalEmail} onChange={onChange} disabled={isView} />
                    </div>

                    {/* ID Proofs */}
                    <div>
                      <Input label="Aadhaar Number" name="aadhar" type="number" value={form.aadhar} required
                        onChange={e => { if (e.target.value.length <= 12) onChange(e); }} disabled={isView} placeholder="12-digit number" />
                      <ErrorMsg name="aadhar" />
                    </div>
                    <div>
                      <Input label="PAN Number" name="pan" value={form.pan} onChange={onChange} disabled={isView} placeholder="ABCDE1234F" />
                      <ErrorMsg name="pan" />
                    </div>

                    {/* Address */}
                    <div className="col-span-2">
                      <Input label="Address" name="address" value={form.address} onChange={onChange} multiline rows={2} disabled={isView} />
                    </div>
                    <div>
                      <Select
                        key={city ? `city-${city.value}` : "city-empty"}
                        label="City" options={cityOptions} value={city} disabled={isView}
                        onChange={v => { setCity(v); setErrors(p => { const n={...p}; delete n.city; return n; }); }}
                        searchable serverSearch onSearch={fetchCities} placeholder="Search city..." />
                    </div>
                    <div>
                      <Input label="Pincode" name="pincode" value={form.pincode} onChange={onChange} disabled={isView} />
                    </div>
                    <Input label="Taluka"   value={form.taluka}   disabled />
                    <Input label="District" value={form.district} disabled />
                    <Input label="State"    value={form.state}    disabled />
                    <Input label="Country"  value={form.country}  disabled />
                  </div>
                )}

                {/* ══════════════════════════════════════════════
                    TAB 1 — JOB DETAILS
                ══════════════════════════════════════════════ */}
                {activeTab === 1 && (
                  <div className="grid grid-cols-2 gap-x-6 gap-y-4 p-4">
                    <div>
                      <Input label="Date of Joining" name="doj" type="date" required value={form.doj} onChange={onChange} disabled={isView} />
                      <ErrorMsg name="doj" />
                    </div>
                    <div>
                      <Select label="Employee Type" options={empTypeOptions} value={empTypeOption} disabled={isView}
                        onChange={v => { setEmpTypeOption(v); setErrors(p => { const n={...p}; delete n.empType; return n; }); }}
                        placeholder="Select type..." />
                      <ErrorMsg name="empType" />
                    </div>

                    {/* Department → resets designation */}
                    <div>
                      <Select
                        key={department ? `dept-${department.value}` : "dept-empty"}
                        label="Department" options={departmentOptions} value={department} disabled={isView}
                        onChange={async v => {
                          setDepartment(v);
                          setDesignation(null);
                          setDesignationOptions([]);
                          setErrors(p => { const n={...p}; delete n.department; return n; });
                          if (v?.value) await fetchDesignations("", parseInt(v.value));
                        }}
                        searchable serverSearch onSearch={fetchDepartments} placeholder="Search department..." />
                      <ErrorMsg name="department" />
                    </div>

                    {/* Designation — filtered by dept */}
                    <div>
                      <Select
                        key={designation ? `des-${designation.value}` : "des-empty"}
                        label="Designation" options={designationOptions} value={designation} disabled={isView || !department}
                        onChange={v => { setDesignation(v); setErrors(p => { const n={...p}; delete n.designation; return n; }); }}
                        searchable serverSearch
                        onSearch={s => fetchDesignations(s, department ? parseInt(department.value) : 0)}
                        placeholder={department ? "Select designation..." : "Select department first..."} />
                      <ErrorMsg name="designation" />
                    </div>

                    {/* Reporting manager */}
                    <div className="col-span-2">
                      <Select
                        key={manager ? `mgr-${manager.value}` : "mgr-empty"}
                        label="Reporting Manager" options={managerOptions} value={manager} disabled={isView}
                        onChange={v => setManager(v)}
                        searchable serverSearch onSearch={fetchManagers} placeholder="Search manager (optional)..." />
                    </div>

                    <div>
                      <Input label="Work Location" name="workLocation" value={form.workLocation} onChange={onChange} disabled={isView} />
                    </div>
                    <div>
                      <Select label="Shift" options={shiftOptions} value={shiftOption} disabled={isView}
                        onChange={v => setShiftOption(v)} placeholder="Select shift..." />
                    </div>
                    <div className="col-span-2">
                      <Input label="Work Email" name="workEmail" value={form.workEmail} onChange={onChange} disabled={isView} />
                      <ErrorMsg name="workEmail" />
                    </div>

                    {/* Probation + Confirmation */}
                    <div>
                      <Input label="Probation Period (months)" name="probationMonths" type="number" value={form.probationMonths} onChange={onChange} disabled={isView} placeholder="e.g. 3" />
                    </div>
                    <div>
                      <Input label="Confirmation Date" name="confirmationDate" type="date" value={form.confirmationDate} onChange={onChange} disabled={isView} />
                    </div>

                    <div>
                      <Input label="CTC (Annual)" name="ctc" type="number" value={form.ctc} onChange={onChange} disabled={isView} placeholder="e.g. 600000" />
                    </div>

                    {/* Status */}
                    <div className="col-span-2 flex items-center gap-2 mt-2">
                      <Input type="checkbox" id="status-check" label="Active" checked={form.isActive} disabled={isView}
                        onChange={e => setForm({ ...form, isActive: e.target.checked })} />
                    </div>
                  </div>
                )}

                {/* ══════════════════════════════════════════════
                    TAB 2 — DOCUMENTS
                ══════════════════════════════════════════════ */}
                {activeTab === 2 && (
                  <div className="grid grid-cols-2 gap-x-6 gap-y-6 p-4">
                    {/* Aadhar Card */}
                    <div>
                      <Input
                        type="file"
                        label="Aadhar Card"
                        name="emp_doc_aadhar_file"
                        ref={docAadharRef}
                        disabled={isView}
                        accept="image/*,application/pdf"
                        previewUrl={docAadharPreview}
                        onChange={handleDocAadharChange}
                      />
                      <ErrorMsg name="docAadhar" />
                    </div>

                    {/* PAN Card */}
                    <div>
                      <Input
                        type="file"
                        label="PAN Card"
                        name="emp_doc_pan_file"
                        ref={docPanRef}
                        disabled={isView}
                        accept="image/*,application/pdf"
                        previewUrl={docPanPreview}
                        onChange={handleDocPanChange}
                      />
                      <ErrorMsg name="docPan" />
                    </div>

                    {/* Offer Letter */}
                    <div>
                      <Input
                        type="file"
                        label="Offer Letter"
                        name="emp_doc_offer_file"
                        ref={docOfferRef}
                        disabled={isView}
                        accept="image/*,application/pdf"
                        previewUrl={docOfferPreview}
                        onChange={handleDocOfferChange}
                      />
                      <ErrorMsg name="docOffer" />
                    </div>

                    {/* Experience Letter */}
                    <div>
                      <Input
                        type="file"
                        label="Experience Letter"
                        name="emp_doc_experience_file"
                        ref={docExpRef}
                        disabled={isView}
                        accept="image/*,application/pdf"
                        previewUrl={docExpPreview}
                        onChange={handleDocExpChange}
                      />
                      <ErrorMsg name="docExp" />
                    </div>

                    {/* Education Certificate */}
                    <div>
                      <Input
                        type="file"
                        label="Education Certificate"
                        name="emp_doc_education_file"
                        ref={docEduRef}
                        disabled={isView}
                        accept="image/*,application/pdf"
                        previewUrl={docEduPreview}
                        onChange={handleDocEduChange}
                      />
                      <ErrorMsg name="docEdu" />
                    </div>

                    {/* Other Document */}
                    <div>
                      <Input
                        type="file"
                        label="Other Document"
                        name="emp_doc_other_file"
                        ref={docOtherRef}
                        disabled={isView}
                        accept="image/*,application/pdf"
                        previewUrl={docOtherPreview}
                        onChange={handleDocOtherChange}
                      />
                      <ErrorMsg name="docOther" />
                      <Input
                        label="Document Label"
                        name="docOtherLabel"
                        value={form.docOtherLabel}
                        onChange={onChange}
                        disabled={isView}
                        placeholder="e.g. Relieving Letter"
                      />
                    </div>
                  </div>
                )}

                {/* ══════════════════════════════════════════════
                    TAB 3 — BANK DETAILS
                ══════════════════════════════════════════════ */}
                {activeTab === 3 && (
                  <div className="grid grid-cols-2 gap-x-6 gap-y-4 p-4">
                    <div>
                      <Input label="Bank Name" name="bankName" value={form.bankName} onChange={onChange} disabled={isView} />
                    </div>
                    <div>
                      <Select label="Account Type" options={accountTypeOptions} value={accountTypeOption} disabled={isView}
                        onChange={v => setAccountTypeOption(v)} placeholder="Select type..." />
                    </div>
                    <div>
                      <Input label="Account Number" name="accountNumber" type="number" value={form.accountNumber} onChange={onChange} disabled={isView} />
                    </div>
                    <div>
                      <Input label="Confirm Account Number" name="confirmAccountNumber" type="number" value={form.confirmAccountNumber} onChange={onChange} disabled={isView} />
                      <ErrorMsg name="confirmAccountNumber" />
                    </div>
                    <div>
                      <Input label="IFSC Code" name="ifscCode" value={form.ifscCode} onChange={onChange} disabled={isView} placeholder="SBIN0001234" />
                      <ErrorMsg name="ifscCode" />
                    </div>
                    <div>
                      <Input label="Branch Name" name="branchName" value={form.branchName} onChange={onChange} disabled={isView} />
                    </div>
                    <div className="col-span-2">
                      <Input label="UPI ID" name="upiId" value={form.upiId} onChange={onChange} disabled={isView} placeholder="name@upi" />
                    </div>
                  </div>
                )}

                {/* ── Tab navigation + Actions ── */}
                <div className="col-span-2 flex items-center justify-between px-4 pb-4 pt-2 border-t border-gray-100 mt-2">
                  <div className="flex gap-2">
                    {activeTab > 0 && (
                      <Button type="button" variant="cancel" onClick={() => setActiveTab(t => t - 1)}>
                        Previous
                      </Button>
                    )}
                    {activeTab < TABS.length - 1 && (
                      <Button type="button" variant="submit" onClick={() => { if (validateTab(activeTab)) setActiveTab(t => t + 1); }}>
                        Next
                      </Button>
                    )}
                  </div>
                  <div className="flex gap-3">
                    {!isView && activeTab === TABS.length - 1 && (
                      <Button type="submit" variant="submit" disabled={loading}>
                        {loading ? "Saving..." : "Save Employee"}
                      </Button>
                    )}
                    <Button type="button" variant="cancel" onClick={() => navigate("/Employee_list")}>
                      Cancel
                    </Button>
                  </div>
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

export default Employee_Master;