import Sidebar from "../../../../components/Sidebar";
import Header from "../../../../components/Header";
import Footer from "../../../../components/Footer";

const AdminLayout = ({ children }) => {
  return (
    <div className="flex min-h-screen bg-[#DFD0B8] font-poppins">
      <Sidebar />

      <div className="flex-1 flex flex-col">
        <Header />
        <main className="flex-1 p-6">{children}</main>
        <Footer />
      </div>
    </div>
  );
};

export default AdminLayout;
