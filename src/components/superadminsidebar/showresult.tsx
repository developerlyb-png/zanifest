"use client";

import React, { useEffect, useMemo, useState } from "react";
import axios from "axios";
import styles from "@/styles/components/superadminsidebar/reviewApplications.module.css";
import FilterPanel from "./FilterPanel";

const ITEMS_PER_PAGE = 10;

type FilterType = {
  field: string;
  condition: string;
  value: string;
};

export default function ShowResult() {
  const [resultData, setResultData] = useState<any[]>([]);
  const [filters, setFilters] = useState<FilterType[]>([
    { field: "", condition: "is", value: "" },
  ]);
  const [operator, setOperator] = useState<"AND" | "OR">("AND");
  const [showFilter, setShowFilter] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);

  // ================= LOAD AGENTS =================
  const loadAgents = async () => {
    const res = await axios.get("/api/getallagents");
    setResultData(res.data || []);
  };

  useEffect(() => {
    loadAgents();
  }, []);

  // ================= PDF GENERATE =================
  const generatePDF = async (agentId: string) => {
    try {
      const res = await axios.post("/api/createCertificate", { agentId });

      setResultData((prev) =>
        prev.map((a) =>
          a._id === agentId ? { ...a, certificate: res.data.url } : a
        )
      );
    } catch {
      alert("PDF generate failed");
    }
  };

  // ================= FILTER HANDLERS =================
  const updateFilter = (
    index: number,
    key: keyof FilterType,
    value: string
  ) => {
    const newFilters = [...filters];
    newFilters[index][key] = value;
    setFilters(newFilters);
  };

  const addFilter = () => {
    setFilters([...filters, { field: "", condition: "is", value: "" }]);
  };

  const removeFilter = (index: number) => {
    setFilters(filters.filter((_, i) => i !== index));
  };

  const clearFilters = () => {
    setFilters([{ field: "", condition: "is", value: "" }]);
  };

  // ================= APPLY FILTER LOGIC =================
  const processedData = useMemo(() => {
    if (!filters.length) return resultData;

    return resultData.filter((agent) => {
      const results = filters.map((f) => {
        if (!f.field || !f.value) return true;

        let agentValue =
          agent[f.field]?.toString().toLowerCase() || "";

        let filterValue = f.value.toLowerCase();

        // PASS / FAIL mapping
        if (f.field === "status") {
          if (filterValue === "pass") filterValue = "approved";
          if (filterValue === "fail") filterValue = "rejected";
        }

        if (f.condition === "is") {
          return agentValue === filterValue;
        }

        if (f.condition === "contains") {
          return agentValue.includes(filterValue);
        }

        return true;
      });

      return operator === "AND"
        ? results.every(Boolean)
        : results.some(Boolean);
    });
  }, [filters, operator, resultData]);

  // ================= PAGINATION =================
  const totalPages = Math.ceil(processedData.length / ITEMS_PER_PAGE);

  const paginatedData = processedData.slice(
    (currentPage - 1) * ITEMS_PER_PAGE,
    currentPage * ITEMS_PER_PAGE
  );

  // ================= UI =================
  return (
    <div className={styles.pageWrapper}>
      <h2 className={styles.title}>Agent Result</h2>

      {/* FILTER BUTTON + PANEL */}
      <div style={{ position: "relative", marginBottom: 15 }}>
        <button
          onClick={() => setShowFilter(!showFilter)}
          className={styles.reviewBtn}
        >
          🔎 Search
        </button>

        <FilterPanel
          showFilter={showFilter}
          setShowFilter={setShowFilter}
          filters={filters}
          operator={operator}
          updateFilter={updateFilter}
          addFilter={addFilter}
          removeFilter={removeFilter}
          clearFilters={clearFilters}
          setOperator={setOperator}
        />
      </div>

      {/* TABLE */}
      <table className={styles.table}>
        <thead>
          <tr>
            <th>S.No</th>
            <th>Agent Code</th>
            <th>Status</th>
            <th>Certificate</th>
          </tr>
        </thead>

        <tbody>
          {paginatedData.map((agent, i) => (
            <tr key={agent._id}>
              <td>
                {(currentPage - 1) * ITEMS_PER_PAGE + i + 1}
              </td>

              <td>{agent.agentCode}</td>

              <td>
                {agent.status === "approved" ? "PASS" : "FAIL"}
              </td>

              <td>
                {agent.status === "approved" && !agent.certificate && (
                  <button
                    className={styles.reviewBtn}
                    onClick={() => generatePDF(agent._id)}
                  >
                    Generate PDF
                  </button>
                )}

                {agent.status === "approved" && agent.certificate && (
                  <button
                    className={styles.reviewBtn}
                    onClick={() =>
                      window.open(
                        `${window.location.origin}${agent.certificate}`,
                        "_blank"
                      )
                    }
                  >
                    Download PDF
                  </button>
                )}
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      {/* PAGINATION */}
      {totalPages > 1 && (
        <div style={{ marginTop: 15 }}>
          <button
            disabled={currentPage === 1}
            onClick={() => setCurrentPage((p) => p - 1)}
          >
            Prev
          </button>

          <span style={{ margin: "0 10px" }}>
            Page {currentPage}/{totalPages}
          </span>

          <button
            disabled={currentPage === totalPages}
            onClick={() => setCurrentPage((p) => p + 1)}
          >
            Next
          </button>
        </div>
      )}
    </div>
  );
}
