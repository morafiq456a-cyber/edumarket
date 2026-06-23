const Footer = () => {
  return (
    <footer className="mt-16 border-t border-slate-200 bg-white">
      <div className="container-app py-10 text-center">
        <h3 className="text-lg font-bold text-slate-900">EduMarket</h3>
        <p className="text-sm text-slate-500 mt-2">منصة تعليمية احترافية</p>
        <p className="text-sm text-slate-400 mt-3">
          © {new Date().getFullYear()} EduMarket. All rights reserved.
        </p>
      </div>
    </footer>
  );
};

export default Footer;