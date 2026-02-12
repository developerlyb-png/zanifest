  "use client";

  import React, { useEffect, useState } from "react";
  import axios from "axios";
  import styles from "@/styles/components/superadminsidebar/reviewApplications.module.css";
  import { useRouter } from "next/navigation";

  export default function ShowResult() {

    const [agents, setAgents] = useState<any[]>([]);
    const [showModal, setShowModal] = useState(false);
    const [selectedAgent, setSelectedAgent] = useState<any>(null);
  const router = useRouter();

    // ================= LOAD AGENTS =================
    const loadAgents = async () => {
      const res = await axios.get("/api/getallagents");
      setAgents(res.data || []);
    };

    useEffect(() => {
      loadAgents();
    }, []);

    // ================= UPDATE STATUS =================
 const updateApproved = async (agentId:string,url?:string)=>{

  const res = await axios.post("/api/updateStatus",{
    id:agentId,
    status:"approved",
    certificate:url || ""
  });

  // 👇 VERY IMPORTANT
  localStorage.setItem("agentId",agentId);

  setSelectedAgent((prev:any)=>({
    ...prev,
    certificate:url,
    status:"approved",
    agentCode:res.data.newCode || prev.agentCode
  }));

  loadAgents();

  router.push("/agentlogin");
}

    // ================= GENERATE =================
    const generatePDF = async ()=>{
      try{

        const res = await axios.post("/api/createCertificate",{
          agentId:selectedAgent._id
        });

        await updateApproved(selectedAgent._id,res.data.url);

        alert("Certificate Generated");

      }catch(err){
        console.log(err);
        alert("Generate Failed");
      }
    }

    // ================= UPLOAD =================
    const uploadCertificate = async (file:File)=>{

      const formData = new FormData();
      formData.append("file",file);
      formData.append("agentId",selectedAgent._id);

      try{

        const res = await axios.post("/api/uploadCertificate",formData);

        await updateApproved(selectedAgent._id,res.data.url);

        alert("Upload Success");

      }catch{
        alert("Upload Failed");
      }
    }

    return (
      <div className={styles.pageWrapper}>
        <h2 className={styles.title}>Agent Review</h2>

        <table className={styles.table}>
          <thead>
            <tr>
              <th>Agent Code</th>
              <th>Name</th>
              <th>Email</th>
              <th>Status</th>
              <th>Action</th>
            </tr>
          </thead>

          <tbody>
            {agents.map((agent)=>(
              <tr key={agent._id}>
                <td>{agent.agentCode || "-"}</td>
                <td>{agent.firstName} {agent.lastName}</td>
                <td>{agent.email}</td>

                <td>{agent.status || "pending"}</td>

                <td>
                  {agent.status !== "approved" && (
                    <>
                      <button
                        className={styles.reviewBtn}
                        onClick={()=>{
                          setSelectedAgent(agent);
                          setShowModal(true);
                        }}
                      >
                        PASS
                      </button>

                      <button className={styles.failBtn}>
                        FAIL
                      </button>
                    </>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        {/* ================= MODAL ================= */}
        {showModal && selectedAgent && (
          <div className={styles.modalOverlay}>
            <div className={styles.modalBox}>

              <button
                className={styles.closeBtn}
                onClick={()=>setShowModal(false)}
              >
                ✖
              </button>

              <h2>Agent Action</h2>

              <div style={{display:"flex",gap:20,flexWrap:"wrap"}}>

                <div className={styles.reviewBtn}>
                  Agent Code : {selectedAgent.agentCode || "Pending"}
                </div>

                <input
                  type="file"
                  onChange={(e)=>{
                    const file=e.target.files?.[0];
                    if(file) uploadCertificate(file);
                  }}
                />

                <button
                  className={styles.reviewBtn}
                  onClick={generatePDF}
                >
                  Generate Certificate
                </button>

                {selectedAgent.certificate && (
                  <button
                    className={styles.reviewBtn}
                    onClick={()=>
                      window.open(
                        `${window.location.origin}${selectedAgent.certificate}`,
                        "_blank"
                      )
                    }
                  >
                    Download Certificate
                  </button>
                )}

              </div>
            </div>
          </div>
        )}

      </div>
    );
  }
