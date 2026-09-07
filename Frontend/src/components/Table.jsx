const Table = ({ columns = [], data = [] }) => {
  return (
    <div className="overflow-x-auto rounded-xl border border-[#393E46]">
      <table className="min-w-full bg-[#DFD0B8]">

        <thead className="bg-[#393E46] text-[#DFD0B8]">
          <tr>
            {columns.map((col, i) => (
              <th
                key={i}
                className={`px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide
                  ${i !== columns.length - 1 ? "border-r border-[#4a5058]" : ""}`}
              >
                {col}
              </th>
            ))}
          </tr>
        </thead>

        <tbody className="divide-y divide-[#c4b49e]">
          {data.length === 0 ? (
            <tr>
              <td
                colSpan={columns.length}
                className="px-4 py-6 text-center text-sm text-[#7a6a55] italic"
              >
                No records found
              </td>
            </tr>
          ) : (
            data.map((row, rIdx) => (
              <tr key={rIdx} className="cursor-pointer">
                {columns.map((col, cIdx) => (
                  <td
                    key={cIdx}
                    className={`px-4 py-2 text-sm
                      ${cIdx !== columns.length - 1 ? "border-r border-[#c4b49e]" : ""}`}
                  >
                    {row[col] ?? ""}
                  </td>
                ))}
              </tr>
            ))
          )}
        </tbody>

      </table>
    </div>
  );
};

export default Table;