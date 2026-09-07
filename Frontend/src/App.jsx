import React from "react";
import { Routes, Route, Navigate } from "react-router-dom";
import Company_master from "./layouts/Config/Master Page/Company_master";
import Country_Master from "./layouts/Config/Master Page/Country_master";
import State_Master from "./layouts/Config/Master Page/State_master";
import District_Master from "./layouts/Config/Master Page/District_Master";
import Taluka_Master from "./layouts/Config/Master Page/Taluka_Master";
import City_Master from "./layouts/Config/Master Page/City_Master";
import User_Group_master from "./layouts/Config/Master Page/User_Group_master";
import User_Master from "./layouts/Config/Master Page/User_Master";
import GST_Slab_Master from "./layouts/Config/Master Page/GST_Slab_Master";
import Unit_of_Measure_Master from "./layouts/Config/Master Page/Unit_of_Measure_Master";
import Item_Type_Master from "./layouts/Cateloge/Formpage/Item_Type_Master";
import HSN_Code_Master from "./layouts/Config/Master Page/HSN_Code_Master";
import Item_Category_Master from "./layouts/Cateloge/Formpage/Item_Category_Master";
import Item_Master from "./layouts/Cateloge/Formpage/Item_Master"; 
import Company_list from "./layouts/Config/List Page/Company_list";
import City_list from "./layouts/Config/List Page/City_list";
import Taluka_list from "./layouts/Config/List Page/Taluka_list";
import District_list from "./layouts/Config/List Page/District_list";
import State_list from "./layouts/Config/List Page/State_list";
import Country_list from "./layouts/Config/List Page/Country_list";
import User_Group_list from "./layouts/Config/List Page/User_Group_list";
import GST_Slab_list from "./layouts/Config/List Page/GST_Slab_list";
import Unit_of_Measure_list from "./layouts/Config/List Page/Unit_of_Measure_list";
import Item_Category_list from "./layouts/Cateloge/Listpage/Item_Category_list";
import Item_Master_List from "./layouts/Cateloge/Listpage/Item_master_list";
import User_list from "./layouts/Config/List Page/User_list";
import Item_Type_list from "./layouts/Cateloge/Listpage/Item_Type_list";
import HSN_Code_List from "./layouts/Config/List Page/HSN_Code_List";
import ErrorPage from "./ErrorPage";
import Entity_Group_Master from "./layouts/Entity/Master Page/Entity_Group_Master";
import Entity_Group_list from "./layouts/Entity/List Page/Entity_Group_list";
import Vendor_Customer_Master from "./layouts/Entity/Master Page/Vendor_Customer_Master";
import Vendor_Customer_list from "./layouts/Entity/List Page/Vendor_Customer_list";
import Store_Location_Master from "./layouts/Store/Formpage/Store_Location_Master";
import Store_Location_list from "./layouts/Store/Listpage/Store_Location_list";
import Menu_master from "./layouts/Config/Master Page/Menu_master";
import Menu_list from "./layouts/Config/List Page/Menu_list";
import User_wise_menu_rides from "./layouts/Config/Master Page/User_wise_menu_rides";
// import User_wise_menu_list from "./layouts/Config/List Page/User_wise_menu_list";
import Purchase_Requisition_form from "./layouts/Purchase/Form Page/Purchase_Requisition_form";
import Purchase_Requisition_list from "./layouts/Purchase/List Page/Purchase_Requisition_list";
import Department_Master from "./layouts/HR/Form Page/Department_Master";
import Department_list from "./layouts/HR/List page/Department_list"; 
import Entity_Master from "./layouts/Entity/Master Page/Entity_Master";
import Entity_list from "./layouts/Entity/List Page/Entity_list";
import Dashboard from "./layouts/Dashboard/Dashboard"; 
import Purchase_Inquiry_form from "./layouts/Purchase/Form Page/Purchase_Inquiry_form";

// Auth Components
import Login from "./layouts/Auth/Login";
import ProtectedRoute from "./components/ProtectedRoute";
import Welcome from "./Pages/Welcome";
import Designation_Master from "./layouts/HR/Form Page/Designation_Master";
import Designation_list from "./layouts/HR/List Page/Designation_list";
import Employee_Master from "./layouts/HR/Form Page/Employee_Master";
import Employee_list from "./layouts/HR/List Page/Employee_list";
import ERPHomepage from "./Pages/ERPHomepage";
import AboutUsPage from "./Pages/AboutUsPage";
import ServicesPage from "./Pages/ServicesPage";
import OurTeamPage from "./Pages/OurTeamPage";
import ClientsPage from "./Pages/ClientsPage";
import ContactUsPage from "./Pages/ContactUsPage";
import Purchase_Inquiry_list from "./layouts/Purchase/List Page/Purchase_Inquiry_list";
import Purchase_Quotation_form from "./layouts/Purchase/Form Page/Purchase_Quotation_form";
import Purchase_Quotation_list from "./layouts/Purchase/List Page/Purchase_Quotation_list";
import Purchase_Order_form from "./layouts/Purchase/Form Page/Purchase_Order_form";
import Purchase_Order_list from "./layouts/Purchase/List Page/Purchase_Order_list";
import GRN_list from "./layouts/Purchase/List Page/GRN_list";
import GRN_form from "./layouts/Purchase/Form Page/GRN_form";
import Leave_Master from "./layouts/HR/Form Page/Leave_Master";
import Leave_Request_List from "./layouts/HR/List Page/Leave_Request_List ";
import Attendance_Form from "./layouts/HR/Form Page/Attendance_Form";
import Attendance_List from "./layouts/HR/List Page/Attendance_List";
import Purchase_Invoice_form from "./layouts/Purchase/Form Page/Purchase_Invoice_form";
import Purchase_Invoice_list from "./layouts/Purchase/List Page/Purchase_Invoice_list";
// import NewsDetail from "./routes/NewsDetail";
// import PurchaseInvoiceForm from "./layouts/Purchase/Form Page/PurchaseInvoiceForm";

function App() {
  return (
    <div className="site-zoom-container">
     <Routes>
       {/* Public Route */}
       <Route path="/" element={<Navigate to="/ERPHomepage" replace />} />
       <Route path="/login" element={<Login />} />
       <Route path="/ERPHomepage" element={<ERPHomepage/>}/>
       <Route path="/AboutUsPage" element={<AboutUsPage/>}/>
       <Route path="/ServicesPage" element={<ServicesPage/>}/>
       <Route path="/OurTeamPage" element={<OurTeamPage/>}/>
       <Route path="/ClientsPage" element={<ClientsPage/>}/>
       <Route path="/ContactUsPage" element={<ContactUsPage/>}/>
       {/* Protected Routes */}
       <Route element={<ProtectedRoute />}>
      {/* <Route path="/" element={<Welcome />} /> */}
      <Route path="/Welcome" element={<Welcome />} />
      <Route path="/Dashboard" element={<Dashboard />}/>    
      <Route path="/Company_master" element={<Company_master />}/>
      <Route path="/Country_master" element={<Country_Master />}/>
      <Route path="/State_master" element={<State_Master />} />
      <Route path="/District_Master" element={<District_Master />}/>
      <Route path="/Taluka_Master" element={<Taluka_Master />}/>  
      <Route path="/City_Master" element={<City_Master />}/>
      <Route path="/User_Group_master" element={<User_Group_master />}/>
      <Route path="/User_Master" element={<User_Master />} />
      <Route path="/GST_Slab_Master" element={<GST_Slab_Master />}/>
      <Route path="/Unit_of_Measure_Master" element={<Unit_of_Measure_Master />}/>
      <Route path="/Item_Type_Master" element={<Item_Type_Master />}/>
      <Route path="/HSN_Code_Master" element={<HSN_Code_Master />}/>
      <Route path="/Item_Category_Master" element={<Item_Category_Master />}/>
      <Route path="/Item_Master" element={<Item_Master/>}/>
      <Route path="/Company_list" element={<Company_list/>}/>
      <Route path="/City_list" element={<City_list />}/>
      <Route path="/Taluka_list" element={<Taluka_list />}/>
      <Route path="/District_list" element={<District_list />}/>
      <Route path="/State_list" element={<State_list />}/>
      <Route path="/Country_list" element={<Country_list />}/>
      <Route path="/User_Group_list" element={<User_Group_list />}/>
      <Route path="/GST_Slab_list" element={<GST_Slab_list />}/>
      <Route path="/Unit_of_Measure_list" element={<Unit_of_Measure_list />}/>
      <Route path="/Item_Category_list" element={<Item_Category_list />}/>
      <Route path="/Item_Master_list" element={<Item_Master_List />}/>
      <Route path="/User_list" element={<User_list />}/>
      <Route path="/Item_Type_list" element={<Item_Type_list />}/>
      <Route path="/HSN_Code_List" element={<HSN_Code_List />}/>
      <Route path="/ErrorPage" element ={<ErrorPage />}/>
      <Route path="/Entity_Group_Master" element={<Entity_Group_Master />}/>
      <Route path="/Entity_Group_list" element={<Entity_Group_list />}/>
      <Route path="/Vendor_Customer_Master" element={<Vendor_Customer_Master  />}/>
      <Route path="/Vendor_Customer_list" element={<Vendor_Customer_list />}/>
      <Route path="/Store_Location_Master" element={<Store_Location_Master />}/>
      <Route path="/Store_Location_list" element={<Store_Location_list />}/>
      <Route path="/Menu_master" element={<Menu_master />}/>
      <Route path="/Menu_list" element={<Menu_list />}/>
      <Route path="/User_wise_menu_rides" element={<User_wise_menu_rides />}/>
      {/* <Route path="/User_wise_menu_list" element={<User_wise_menu_list />}/> */}
      <Route path="/Purchase_Requisition_form" element={<Purchase_Requisition_form />}/>
      <Route path="/Purchase_Requisition_list" element={<Purchase_Requisition_list />}/>
      <Route path="/Department_Master" element={<Department_Master />}/>
      <Route path="/Department_list" element={<Department_list />}/>
      <Route path="/Entity_Master" element={<Entity_Master />}/>
      <Route path="/Entity_list" element={<Entity_list />}/>
      <Route path="/Purchase_Inquiry_form" element={<Purchase_Inquiry_form/>}/>
      <Route path="/Purchase_Inquiry_list" element={<Purchase_Inquiry_list/>}/>
      <Route path="/Designation_Master" element={<Designation_Master/>}/>
      <Route path="/Designation_list" element={<Designation_list/>}/>
      <Route path="/Employee_master" element={<Employee_Master/>}/>
      <Route path="/Employee_list" element={<Employee_list/>}/>
      <Route path="/Purchase_Quotation_form" element={<Purchase_Quotation_form/>}/>
      <Route path="/Purchase_Quotation_list" element={<Purchase_Quotation_list/>}/>
      <Route path="/Purchase_Order_form" element={<Purchase_Order_form/>}/>
      <Route path="/Purchase_Order_list" element={<Purchase_Order_list/>}/>
      <Route path="/GRN_form" element={<GRN_form/>}/>
      <Route path="/GRN_list" element={<GRN_list/>}/>
      <Route path="/Leave_Master" element={<Leave_Master/>}/>
      <Route path="/Leave_Request_List" element={<Leave_Request_List/>}/>
      <Route path="/Attendance_Form" element={<Attendance_Form/>}/>
      <Route path="/Attendance_List" element={<Attendance_List/>}/>
      <Route path="/Purchase_Invoice_form" element={<Purchase_Invoice_form/>}/>
      <Route path="/Purchase_Invoice_list" element={<Purchase_Invoice_list/>}/>
      </Route>
    
      {/* Fallback Route */}  
      <Route path="*" element={<ErrorPage />} />
    </Routes>
    </div>
  );
}

export default App;
