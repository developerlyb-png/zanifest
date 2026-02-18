"use client";

import React, { useEffect, useMemo, useState } from "react";
import axios from "axios";
import styles from "@/styles/components/superadminsidebar/reviewApplications.module.css";

export default function ShowResult() {

  const [agents, setAgents] = useState<any[]>([]);
  const [showModal, setShowModal] = useState(false);
  const [selectedAgent, setSelectedAgent] = useState<any>(null);

  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");

  const [currentPage, setCurrentPage] = useState(1);
  const [rowsPerPage, setRowsPerPage] = useState(10);

  // ⭐ SUCCESS MESSAGE
  const [successMsg, setSuccessMsg] = useState("");

  const loadAgents = async () => {
    const res = await axios.get("/api/getallagents");
    setAgents(res.data || []);
  };

  useEffect(() => { loadAgents(); }, []);

  // ⭐ FINAL APPROVE
  const approveAgent = async () => {

    const freshAgent = agents.find(a => a._id === selectedAgent._id);

    if (!freshAgent?.certificate2) {
      alert("Please generate or upload certificate first");
      return;
    }

    await axios.post("/api/updateStatus", {
      id: selectedAgent._id,
      status: "approved"
    });

    setSuccessMsg("Agent approved successfully ✅");
    loadAgents();
  };

  // ⭐ GENERATE PDF
  const generatePDF = async () => {
    await axios.post("/api/createCertificate", { agentId: selectedAgent._id });
    await loadAgents();

    setSuccessMsg("Certificate generated successfully ✅");
  };

  // ⭐ UPLOAD CERTIFICATE
  const uploadCertificate = async (file: File) => {
    const formData = new FormData();
    formData.append("file", file);
    formData.append("agentId", selectedAgent._id);

    await axios.post("/api/uploadCertificate", formData);
    await loadAgents();

    setSuccessMsg("Certificate uploaded successfully ✅");
  };

  const downloadFile = (url: string) => {
    const link = document.createElement("a");
    link.href = `${window.location.origin}${url}`;
    link.download = "";
    link.click();
  };

  // ⭐ FILTER
  const filteredAgents = useMemo(() => {
    return agents
      .filter(a => a.status === "reviewed" || a.status === "approved")
      .filter(a => {

        const matchesSearch =
          a.firstName?.toLowerCase().includes(search.toLowerCase()) ||
          a.lastName?.toLowerCase().includes(search.toLowerCase()) ||
          a.email?.toLowerCase().includes(search.toLowerCase()) ||
          a.agentCode?.toLowerCase().includes(search.toLowerCase());

        const matchesStatus =
          statusFilter === "all" || a.status === statusFilter;

        return matchesSearch && matchesStatus;
      });

  }, [agents, search, statusFilter]);

  const totalPages = Math.ceil(filteredAgents.length / rowsPerPage);

  const paginatedAgents = filteredAgents.slice(
    (currentPage - 1) * rowsPerPage,
    currentPage * rowsPerPage
  );

  const statusBadge = (status:string) => {
    if(status === "approved") return styles.badgeApproved;
    if(status === "reviewed") return styles.badgeReviewed;
    return styles.badgePending;
  };

  return (
    <div className={styles.pageWrapper}>

      <h2 className={styles.title}>Show Result</h2>

      {/* FILTER */}
      <div className={styles.filterBar}>
        <input
          placeholder="Search agent..."
          className={styles.searchInput}
          value={search}
          onChange={(e)=>{ setSearch(e.target.value); setCurrentPage(1); }}
        />

        <select
          className={styles.select}
          value={statusFilter}
          onChange={(e)=>{ setStatusFilter(e.target.value); setCurrentPage(1); }}
        >
          <option value="all">Select Status</option>
          <option value="reviewed">Reviewed</option>
          <option value="approved">Approved</option>
        </select>

        <select
          className={styles.select}
          value={rowsPerPage}
          onChange={(e)=>{
            setRowsPerPage(Number(e.target.value));
            setCurrentPage(1);
          }}
        >
          <option value={5}>5</option>
          <option value={10}>10</option>
          <option value={20}>20</option>
        </select>
      </div>

      {/* TABLE */}
      <table className={styles.table}>
        <thead>
          <tr>
            <th>Agent Code</th>
            <th>Name</th>
            <th>Email</th>
            <th>Status</th>
            <th>Result</th>
            <th>Certificate</th>
            <th>Action</th>
          </tr>
        </thead>

        <tbody>
          {paginatedAgents.map((agent) => (
            <tr key={agent._id} className={styles.tableRow}>
              <td>{agent.agentCode || "-"}</td>
              <td>{agent.firstName} {agent.lastName}</td>
              <td>{agent.email}</td>

              <td>
                <span className={`${styles.statusBadge} ${statusBadge(agent.status)}`}>
                  {agent.status}
                </span>
              </td>

              <td>
                {agent.certificate1 ? (
                  <>
                    <button className={styles.reviewBtn}
                      onClick={()=>window.open(agent.certificate1,"_blank")}>
                      View
                    </button>
                    <button className={styles.reviewBtn}
                      style={{marginLeft:5}}
                      onClick={()=>downloadFile(agent.certificate1)}>
                      Download
                    </button>
                  </>
                ) : "—"}
              </td>

              <td>
                {agent.certificate2 ? (
                  <>
                    <button className={styles.reviewBtn}
                      onClick={()=>window.open(agent.certificate2,"_blank")}>
                      View
                    </button>
                    <button className={styles.reviewBtn}
                      style={{marginLeft:5}}
                      onClick={()=>downloadFile(agent.certificate2)}>
                      Download
                    </button>
                  </>
                ) : "—"}
              </td>

              <td>
                {agent.status === "reviewed" && (
                  <button
                    className={styles.reviewBtn}
                    onClick={()=>{ 
                      setSelectedAgent(agent); 
                      setSuccessMsg(""); 
                      setShowModal(true); 
                    }}
                  >
                    Review
                  </button>
                )}
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      {/* PAGINATION */}
      <div className={styles.pagination}>
        <span>
          Showing {(currentPage-1)*rowsPerPage + 1} -
          {Math.min(currentPage*rowsPerPage, filteredAgents.length)}
          {" "}of {filteredAgents.length}
        </span>

        <div className={styles.pageButtons}>
          <button disabled={currentPage === 1}
            onClick={()=>setCurrentPage(prev=>prev-1)}>Prev</button>

          {Array.from({ length: totalPages }, (_, i) => (
            <button key={i}
              className={currentPage === i+1 ? styles.activePage : ""}
              onClick={()=>setCurrentPage(i+1)}>
              {i+1}
            </button>
          ))}

          <button disabled={currentPage === totalPages}
            onClick={()=>setCurrentPage(prev=>prev+1)}>Next</button>
        </div>
      </div>

      {/* MODAL */}
      {showModal && selectedAgent && (
        <div className={styles.modalOverlay}>
          <div className={styles.modalBox}>

            <button className={styles.closeBtn}
              onClick={()=>setShowModal(false)}>✖</button>

            <h3>Finalize Approval</h3>

            {successMsg && (
              <div className={styles.successBanner}>
                {successMsg}
              </div>
            )}

            <div className={styles.modalActions}>
              <input type="file"
                onChange={(e)=>{
                  const file=e.target.files?.[0];
                  if(file) uploadCertificate(file);
                }}/>

              <button className={styles.reviewBtn}
                onClick={generatePDF}>Generate Certificate</button>

              <button className={styles.finalAcceptBtn}
                onClick={approveAgent}>Final Approve</button>
            </div>

          </div>
        </div>
      )}

    </div>
  );
}
