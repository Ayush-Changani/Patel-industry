const Footer = () => {
  return (
    <footer className="h-12 bg-light border-t border-darkGray flex items-center justify-center text-sm text-darkGray shrink-0">
      © {new Date().getFullYear()} Patel Industries
    </footer>
  );
};

export default Footer;