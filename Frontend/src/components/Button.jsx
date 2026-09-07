import {
  FaSave,
  FaEdit,
  FaTrash,
  FaTimes,
  FaPlus,
  FaFileExcel,
  FaEye,
  FaDownload
} from "react-icons/fa";

const Button = ({
  variant = "submit",
  children,
  icon,
  iconOnly = false,
  ...props
}) => {
  let classes =
    "inline-flex items-center gap-2 px-4 py-2 rounded-xl font-medium transition-all duration-200 transform focus:outline-none focus:ring-2 focus:ring-offset-1";

  let IconComponent = null;

  switch (variant) {
    case "submit":
      classes +=
        " bg-[#948979] text-[#222831] hover:bg-[#393E46] hover:text-[#DFD0B8] hover:shadow-md hover:scale-105 focus:ring-[#948979]";
      // IconComponent = FaSave;
      break;

    case "update":
    case "edit":
      classes +=
        " bg-[#393E46] text-[#DFD0B8] hover:bg-[#222831] hover:shadow-md hover:scale-105 focus:ring-[#393E46]";
      IconComponent = FaEdit;
      break;

    case "delete":
      classes +=
        " bg-[#222831] text-[#DFD0B8] hover:bg-[#393E46] hover:shadow-md hover:scale-105 focus:ring-[#222831]";
      IconComponent = FaTrash;
      break;

    case "cancel":
      classes +=
        " bg-[#DFD0B8] text-[#222831] border border-[#393E46] hover:bg-[#393E46] hover:text-[#DFD0B8] hover:shadow-md hover:scale-105 focus:ring-[#DFD0B8]";
      // IconComponent = FaTimes;
      break;

    case "add":
      classes +=
        " bg-[#1E7E34] text-white hover:bg-[#145C26] hover:shadow-md hover:scale-105 focus:ring-[#1E7E34]";
      IconComponent = FaPlus;
      break;

    case "excel":
      classes +=
        " bg-[#107C41] text-white hover:bg-[#0E6B37] hover:shadow-md hover:scale-105 focus:ring-[#107C41]";
      IconComponent = FaFileExcel;
      break;

    case "view":
      classes +=
        " bg-[#0056B3] text-white hover:bg-[#004494] hover:shadow-md hover:scale-105 focus:ring-[#0056B3]";
      IconComponent = FaEye;
      break;

    case "download":
      classes +=
        " bg-[#6C757D] text-white hover:bg-[#5A6268] hover:shadow-md hover:scale-105 focus:ring-[#6C757D]";
      IconComponent = FaDownload;
      break;

    default:
      break;
  }

  const FinalIcon = icon || IconComponent;

  return (
    <button className={classes} {...props}>
      {FinalIcon && <FinalIcon className="text-sm" />}
      {!iconOnly && children}
    </button>
  );
};

export default Button;
