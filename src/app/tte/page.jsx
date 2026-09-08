"use client";

import { useEffect, useState, useCallback, useRef } from "react";
import { useRouter } from "next/navigation";
import { ViewProvider, ViewToggle } from "@/components/ViewToggle";

const TRAIN_ID = "T12952";

function NotifBadge({ count }) {
  if (!count) return null;
  return (
    <span
      style={{
        background: "#e85d04",
        color: "white",
        borderRadius: "50%",
        width: "18px",
        height: "18px",
        fontSize: "10px",
        fontWeight: "700",
        display: "inline-flex",
        alignItems: "center",
        justifyContent: "center",
        marginLeft: "4px",
      }}
    >
      {count > 9 ? "9+" : count}
    </span>
  );
}

function IntentCard({
  passenger,
  onConfirm,
  onContinue,
  loading,
  willContinue,
  onMarkContinue,
}) {
  const intent = passenger.intent;

  const isLocked =
    intent?.status === "LOCKED" || intent?.status === "TTE_CONFIRMED";

  const isDeboarding = intent?.status === "DEBOARDING_DUE";

  const handleContinue = async () => {
    onMarkContinue(passenger.bookingId);
    await onContinue(passenger);
  };

  return (
    <div
      className="tte-card"
      style={{
        border: isDeboarding ? "2px solid #f97316" : "1px solid #334155",
      }}
    >
      {isDeboarding && (
        <div
          style={{
            background: "#f97316",
            color: "white",
            fontSize: "11px",
            fontWeight: "700",
            padding: "6px 12px",
            borderRadius: "6px 6px 0 0",
            letterSpacing: "0.5px",
            marginBottom: "12px",
            textAlign: "center",
          }}
        >
          🔔 DEBOARDING VERIFICATION REQUIRED
        </div>
      )}

      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "flex-start",
          marginBottom: "12px",
        }}
      >
        <div>
          <div
            style={{
              fontWeight: "700",
              fontSize: "15px",
              color: "#f1f5f9",
            }}
          >
            {passenger.passenger?.name}
          </div>

          <div
            style={{
              fontSize: "11px",
              color: "#64748b",
              marginTop: "2px",
            }}
          >
            PNR: {passenger.pnr} · {passenger.journeyDate}
          </div>
        </div>

        <span
          style={{
            fontSize: "10px",
            fontWeight: "700",
            padding: "3px 8px",
            borderRadius: "4px",
            background:
              intent?.status === "LOCKED"
                ? "#1e3a5f"
                : intent?.status === "DEBOARDING_DUE"
                  ? "#7c2d12"
                  : "#1e3a5f",
            color:
              intent?.status === "LOCKED"
                ? "#93c5fd"
                : intent?.status === "DEBOARDING_DUE"
                  ? "#fed7aa"
                  : "#94a3b8",
          }}
        >
          {intent?.status || "N/A"}
        </span>
      </div>

      <div
        style={{
          display: "grid",
          gridTemplateColumns: "1fr 1fr",
          gap: "8px",
          marginBottom: "12px",
        }}
      >
        <div
          style={{
            background: "#0f172a",
            borderRadius: "6px",
            padding: "8px",
          }}
        >
          <div
            style={{
              fontSize: "10px",
              color: "#64748b",
              fontWeight: "600",
            }}
          >
            COACH / BERTH
          </div>

          <div
            style={{
              fontSize: "16px",
              fontWeight: "800",
              color: "#e85d04",
              marginTop: "2px",
            }}
          >
            {passenger.coach} / {passenger.berth}
          </div>
        </div>

        <div
          style={{
            background: "#0f172a",
            borderRadius: "6px",
            padding: "8px",
          }}
        >
          <div
            style={{
              fontSize: "10px",
              color: "#64748b",
              fontWeight: "600",
            }}
          >
            CLASS
          </div>

          <div
            style={{
              fontSize: "16px",
              fontWeight: "800",
              color: "#f1f5f9",
              marginTop: "2px",
            }}
          >
            {passenger.class}
          </div>
        </div>

        <div
          style={{
            background: "#0f172a",
            borderRadius: "6px",
            padding: "8px",
          }}
        >
          <div
            style={{
              fontSize: "10px",
              color: "#64748b",
              fontWeight: "600",
            }}
          >
            BOARDING
          </div>

          <div
            style={{
              fontSize: "13px",
              fontWeight: "600",
              color: "#f1f5f9",
              marginTop: "2px",
            }}
          >
            {passenger.originName}
          </div>
        </div>

        <div
          style={{
            background: "#0f172a",
            borderRadius: "6px",
            padding: "8px",
          }}
        >
          <div
            style={{
              fontSize: "10px",
              color: "#64748b",
              fontWeight: "600",
            }}
          >
            BOOKED TO
          </div>

          <div
            style={{
              fontSize: "13px",
              fontWeight: "600",
              color: "#e85d04",
              marginTop: "2px",
            }}
          >
            {passenger.destinationName}
          </div>
        </div>
      </div>

      {intent && (
        <div
          style={{
            background: "#0f172a",
            borderRadius: "8px",
            padding: "10px",
            marginBottom: "12px",
            border: "1px solid #334155",
          }}
        >
          <div
            style={{
              fontSize: "10px",
              color: "#f97316",
              fontWeight: "700",
              marginBottom: "6px",
            }}
          >
            DECLARED DEBOARDING INTENT
          </div>

          <div
            style={{
              fontSize: "15px",
              fontWeight: "700",
              color: "#f97316",
            }}
          >
            {intent.deboardingStationName || intent.deboardingStation}
          </div>

          <div
            style={{
              fontSize: "11px",
              color: "#64748b",
              marginTop: "4px",
            }}
          >
            Confidence: {intent.confidence}% · Declared:{" "}
            {new Date(intent.declaredAt).toLocaleTimeString()}
          </div>

          {intent.lockedAt && (
            <div
              style={{
                fontSize: "11px",
                color: "#22c55e",
                marginTop: "2px",
              }}
            >
              🔒 Locked at: {new Date(intent.lockedAt).toLocaleTimeString()}
            </div>
          )}
        </div>
      )}

      {passenger.vacancy && (
        <div
          style={{
            background: "#0f172a",
            borderRadius: "8px",
            padding: "10px",
            marginBottom: "12px",
            border: "1px solid #15803d",
          }}
        >
          <div
            style={{
              fontSize: "10px",
              color: "#22c55e",
              fontWeight: "700",
              marginBottom: "4px",
            }}
          >
            EXPECTED VACANCY
          </div>

          <div
            style={{
              fontSize: "13px",
              fontWeight: "600",
              color: "#4ade80",
            }}
          >
            {passenger.intent?.deboardingStation} → {passenger.destination}
          </div>

          <div
            style={{
              fontSize: "11px",
              color: "#64748b",
              marginTop: "2px",
            }}
          >
            Status: {passenger.vacancy.status} · Confidence:{" "}
            {passenger.vacancy.confidence}%
          </div>
        </div>
      )}

    
      {!isLocked && !isDeboarding && intent?.status === "DECLARED" && (
        <div
          style={{
            display: "flex",
            gap: "8px",
          }}
        >
          
          <button
            onClick={() => onConfirm(passenger)}
            disabled={loading || willContinue}
            style={{
              flex: 1,
              background: loading || willContinue ? "#334155" : "#22c55e",
              color: "white",
              border: "none",
              padding: "10px",
              borderRadius: "8px",
              fontWeight: "700",
              fontSize: "13px",
              cursor: loading || willContinue ? "not-allowed" : "pointer",
              opacity: willContinue ? 0.5 : 1,
            }}
          >
            {willContinue
              ? "✓ PASSENGER WILL CONTINUE"
              : "✓ CONFIRM EARLY DEBOARDING"}
          </button>

          <button
            onClick={handleContinue}
            disabled={loading || willContinue}
            style={{
              flex: 1,
              background: willContinue ? "#334155" : "#475569",
              color: "white",
              border: "none",
              padding: "10px",
              borderRadius: "8px",
              fontWeight: "700",
              fontSize: "13px",
              cursor: loading || willContinue ? "not-allowed" : "pointer",
              opacity: willContinue ? 0.6 : 1,
            }}
          >
            {willContinue ? "✓ CONTINUE NOTED" : "PASSENGER WILL CONTINUE"}
          </button>
        </div>
      )}

      {isLocked && (
        <div
          style={{
            background: "#0f172a",
            border: "1px solid #22c55e",
            borderRadius: "8px",
            padding: "10px",
            textAlign: "center",
          }}
        >
          <div
            style={{
              color: "#22c55e",
              fontWeight: "700",
              fontSize: "13px",
              marginBottom: "4px",
            }}
          >
            ✓ EARLY DEBOARDING VERIFIED & LOCKED
          </div>

          <div
            style={{
              fontSize: "11px",
              color: "#64748b",
            }}
          >
            Passenger cannot modify deboarding station. Intent confirmed at{" "}
            {intent?.deboardingStation}.
          </div>
        </div>
      )}

      {isDeboarding && (
        <div>
          <div
            style={{
              background: "#431407",
              border: "1px solid #f97316",
              borderRadius: "8px",
              padding: "10px",
              marginBottom: "10px",
              textAlign: "center",
            }}
          >
            <div
              style={{
                color: "#f97316",
                fontWeight: "700",
                fontSize: "14px",
              }}
            >
              🚉 DEBOARDING STATION REACHED
            </div>

            <div
              style={{
                fontSize: "12px",
                color: "#fed7aa",
                marginTop: "4px",
              }}
            >
              Check if {passenger.passenger?.name} has deboarded from Coach{" "}
              {passenger.coach}, Berth {passenger.berth}
            </div>
          </div>

          <div
            style={{
              display: "flex",
              gap: "8px",
            }}
          >
            <button
              onClick={() => onConfirm(passenger, true)}
              disabled={loading}
              style={{
                flex: 1,
                background: "#22c55e",
                color: "white",
                border: "none",
                padding: "12px",
                borderRadius: "8px",
                fontWeight: "700",
                fontSize: "13px",
                cursor: loading ? "not-allowed" : "pointer",
              }}
            >
              ✓ PASSENGER DEBOARDED
            </button>

            <button
              onClick={() => onContinue(passenger, true)}
              disabled={loading}
              style={{
                flex: 1,
                background: "#ef4444",
                color: "white",
                border: "none",
                padding: "12px",
                borderRadius: "8px",
                fontWeight: "700",
                fontSize: "13px",
                cursor: loading ? "not-allowed" : "pointer",
              }}
            >
              ✗ STILL ON TRAIN
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

function AllocationCard({ allocation }) {
  if (!allocation) return null;
  const candidate = allocation.recommendedCandidate;

  return (
    <div className="tte-card" style={{ border: "2px solid #22c55e" }}>
      <div
        style={{
          fontSize: "10px",
          color: "#22c55e",
          fontWeight: "700",
          marginBottom: "10px",
          letterSpacing: "0.5px",
        }}
      >
        📋 ALLOCATION RECOMMENDATION
      </div>
      <div
        style={{
          background: "#0f172a",
          borderRadius: "8px",
          padding: "10px",
          marginBottom: "10px",
        }}
      >
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            marginBottom: "4px",
          }}
        >
          <span style={{ color: "#64748b", fontSize: "12px" }}>Candidate</span>
          <span
            style={{ color: "#f1f5f9", fontWeight: "700", fontSize: "12px" }}
          >
            {candidate?.name}
          </span>
        </div>
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            marginBottom: "4px",
          }}
        >
          <span style={{ color: "#64748b", fontSize: "12px" }}>PNR</span>
          <span
            style={{ color: "#f1f5f9", fontWeight: "700", fontSize: "12px" }}
          >
            {candidate?.pnr}
          </span>
        </div>
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            marginBottom: "4px",
          }}
        >
          <span style={{ color: "#64748b", fontSize: "12px" }}>Type</span>
          <span
            style={{
              fontSize: "11px",
              fontWeight: "700",
              padding: "1px 8px",
              borderRadius: "4px",
              background: candidate?.type === "RAC" ? "#854d0e" : "#7c2d12",
              color: candidate?.type === "RAC" ? "#fef9c3" : "#fee2e2",
            }}
          >
            {candidate?.type}
          </span>
        </div>
        <div style={{ display: "flex", justifyContent: "space-between" }}>
          <span style={{ color: "#64748b", fontSize: "12px" }}>Segment</span>
          <span
            style={{ color: "#4ade80", fontWeight: "700", fontSize: "12px" }}
          >
            {allocation.fromStation} → {allocation.toStation}
          </span>
        </div>
      </div>
      <div style={{ fontSize: "11px", color: "#22c55e", marginBottom: "6px" }}>
        {allocation.reasoning}
      </div>
      <div style={{ fontSize: "10px", color: "#475569", lineHeight: 1.4 }}>
        ⚠️ {allocation.disclaimer}
      </div>
    </div>
  );
}

function TrainProgressSimulator({ progress, train, onAdvance, loading }) {
  if (!progress || !train) return null;

  return (
    <div className="tte-card">
     
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          gap: "12px",
          marginBottom: "16px",
        }}
      >
        <div>
          <div
            style={{
              fontSize: "11px",
              color: "#f97316",
              fontWeight: "700",
              letterSpacing: "0.5px",
            }}
          >
            🚆 TRAIN JOURNEY
          </div>

          <div
            style={{
              fontSize: "12px",
              color: "#64748b",
              marginTop: "3px",
            }}
          >
            Train {TRAIN_ID.replace("T", "")}
          </div>
        </div>

        <div
          style={{
            background:
              progress.status === "TERMINATED" ? "#14532d" : "#1e293b",
            border:
              progress.status === "TERMINATED"
                ? "1px solid #22c55e"
                : "1px solid #334155",
            color: progress.status === "TERMINATED" ? "#4ade80" : "#94a3b8",
            padding: "5px 9px",
            borderRadius: "6px",
            fontSize: "10px",
            fontWeight: "700",
            whiteSpace: "nowrap",
          }}
        >
          {progress.status === "TERMINATED" ? "✓ COMPLETED" : "● IN JOURNEY"}
        </div>
      </div>

     
      <div
        className="train-station-summary"
        style={{
          display: "grid",
          gridTemplateColumns: "1fr 1fr",
          gap: "8px",
          marginBottom: "20px",
        }}
      >
        <div
          style={{
            background: "#0f172a",
            border: "1px solid #334155",
            borderRadius: "8px",
            padding: "10px 12px",
            minWidth: 0,
          }}
        >
          <div
            style={{
              fontSize: "9px",
              color: "#64748b",
              fontWeight: "700",
              letterSpacing: "0.4px",
              marginBottom: "4px",
            }}
          >
            CURRENT STATION
          </div>

          <div
            style={{
              fontSize: "14px",
              fontWeight: "800",
              color: "#f97316",
              overflow: "hidden",
              textOverflow: "ellipsis",
              whiteSpace: "nowrap",
            }}
          >
            {progress.currentStation}
          </div>
        </div>

        <div
          style={{
            background: "#0f172a",
            border: "1px solid #334155",
            borderRadius: "8px",
            padding: "10px 12px",
            minWidth: 0,
          }}
        >
          <div
            style={{
              fontSize: "9px",
              color: "#64748b",
              fontWeight: "700",
              letterSpacing: "0.4px",
              marginBottom: "4px",
            }}
          >
            NEXT STATION
          </div>

          <div
            style={{
              fontSize: "14px",
              fontWeight: "800",
              color: "#94a3b8",
              overflow: "hidden",
              textOverflow: "ellipsis",
              whiteSpace: "nowrap",
            }}
          >
            {progress.nextStation || "Terminal"}
          </div>
        </div>
      </div>

      
      <div
        className="train-route-desktop"
        style={{
          width: "100%",
          overflowX: "auto",
          padding: "8px 4px 18px",
          marginBottom: "8px",
        }}
      >
        <div
          style={{
            display: "flex",
            alignItems: "flex-start",
            minWidth: `${train.route.length * 72}px`,
            padding: "0 12px",
          }}
        >
          {train.route.map((code, i) => {
            const isPassed = i < progress.currentStationIndex;

            const isCurrent = i === progress.currentStationIndex;

            const isUpcoming = i > progress.currentStationIndex;

            return (
              <div
                key={`${code}-${i}`}
                style={{
                  flex: "1 1 0",
                  minWidth: "64px",
                  position: "relative",
                }}
              >
               
                {i < train.route.length - 1 && (
                  <div
                    style={{
                      position: "absolute",
                      top: "14px",
                      left: "50%",
                      width: "100%",
                      height: "3px",
                      background: isPassed ? "#22c55e" : "#334155",
                      zIndex: 0,
                    }}
                  />
                )}
 
                <div
                  style={{
                    position: "relative",
                    zIndex: 1,
                    display: "flex",
                    justifyContent: "center",
                  }}
                >
                  <div
                    style={{
                      width: "30px",
                      height: "30px",
                      borderRadius: "50%",
                      background: isPassed
                        ? "#22c55e"
                        : isCurrent
                          ? "#f97316"
                          : "#1e293b",
                      border: isPassed
                        ? "2px solid #22c55e"
                        : isCurrent
                          ? "3px solid #fdba74"
                          : "2px solid #334155",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      boxShadow: isCurrent
                        ? "0 0 0 4px rgba(249,115,22,0.12)"
                        : "none",
                    }}
                  >
                    {isPassed && (
                      <span
                        style={{
                          color: "white",
                          fontSize: "11px",
                          fontWeight: "800",
                        }}
                      >
                        ✓
                      </span>
                    )}

                    {isCurrent && (
                      <span
                        style={{
                          width: "7px",
                          height: "7px",
                          borderRadius: "50%",
                          background: "white",
                        }}
                      />
                    )}

                    {isUpcoming && (
                      <span
                        style={{
                          width: "5px",
                          height: "5px",
                          borderRadius: "50%",
                          background: "#475569",
                        }}
                      />
                    )}
                  </div>
                </div>

                
                <div
                  style={{
                    textAlign: "center",
                    marginTop: "8px",
                    padding: "0 2px",
                  }}
                >
                  <div
                    style={{
                      fontSize: "10px",
                      fontWeight: isCurrent ? "800" : "600",
                      color: isPassed
                        ? "#4ade80"
                        : isCurrent
                          ? "#f97316"
                          : "#64748b",
                      whiteSpace: "nowrap",
                      overflow: "hidden",
                      textOverflow: "ellipsis",
                    }}
                  >
                    {code}
                  </div>

                  <div
                    style={{
                      fontSize: "8px",
                      color: "#475569",
                      marginTop: "2px",
                    }}
                  >
                    {isPassed ? "PASSED" : isCurrent ? "CURRENT" : "UPCOMING"}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      
      <div
        className="train-route-mobile"
        style={{
          display: "none",
        }}
      >
        {train.route.map((code, i) => {
          const isPassed = i < progress.currentStationIndex;

          const isCurrent = i === progress.currentStationIndex;

          const isLast = i === train.route.length - 1;

          return (
            <div
              key={`${code}-mobile-${i}`}
              style={{
                display: "flex",
                minHeight: isLast ? "48px" : "68px",
              }}
            >
           
              <div
                style={{
                  width: "34px",
                  position: "relative",
                  display: "flex",
                  justifyContent: "center",
                  flexShrink: 0,
                }}
              >
              
                {!isLast && (
                  <div
                    style={{
                      position: "absolute",
                      top: "30px",
                      bottom: "0",
                      width: "3px",
                      background: isPassed ? "#22c55e" : "#334155",
                    }}
                  />
                )}

             
                <div
                  style={{
                    position: "relative",
                    zIndex: 2,
                    width: "28px",
                    height: "28px",
                    borderRadius: "50%",
                    background: isPassed
                      ? "#22c55e"
                      : isCurrent
                        ? "#f97316"
                        : "#1e293b",
                    border: isPassed
                      ? "2px solid #22c55e"
                      : isCurrent
                        ? "3px solid #fdba74"
                        : "2px solid #334155",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    boxShadow: isCurrent
                      ? "0 0 0 4px rgba(249,115,22,0.12)"
                      : "none",
                  }}
                >
                  {isPassed && (
                    <span
                      style={{
                        color: "white",
                        fontSize: "10px",
                        fontWeight: "800",
                      }}
                    >
                      ✓
                    </span>
                  )}

                  {isCurrent && (
                    <span
                      style={{
                        width: "7px",
                        height: "7px",
                        borderRadius: "50%",
                        background: "white",
                      }}
                    />
                  )}

                  {!isPassed && !isCurrent && (
                    <span
                      style={{
                        width: "5px",
                        height: "5px",
                        borderRadius: "50%",
                        background: "#475569",
                      }}
                    />
                  )}
                </div>
              </div>

            
              <div
                style={{
                  flex: 1,
                  minWidth: 0,
                  paddingLeft: "10px",
                  paddingBottom: isLast ? "0" : "14px",
                }}
              >
                <div
                  style={{
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "space-between",
                    gap: "8px",
                  }}
                >
                  <div
                    style={{
                      fontSize: "13px",
                      fontWeight: isCurrent ? "800" : "600",
                      color: isPassed
                        ? "#4ade80"
                        : isCurrent
                          ? "#f97316"
                          : "#94a3b8",
                      overflow: "hidden",
                      textOverflow: "ellipsis",
                      whiteSpace: "nowrap",
                    }}
                  >
                    {code}
                  </div>

                  <div
                    style={{
                      fontSize: "8px",
                      fontWeight: "700",
                      letterSpacing: "0.4px",
                      color: isPassed
                        ? "#22c55e"
                        : isCurrent
                          ? "#f97316"
                          : "#475569",
                      flexShrink: 0,
                    }}
                  >
                    {isPassed ? "PASSED" : isCurrent ? "CURRENT" : "UPCOMING"}
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>

    
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          gap: "8px",
          marginTop: "4px",
          marginBottom: "12px",
          padding: "8px 10px",
          background: "#0f172a",
          borderRadius: "6px",
          border: "1px solid #1e293b",
        }}
      >
        <span
          style={{
            fontSize: "10px",
            color: "#64748b",
          }}
        >
          JOURNEY PROGRESS
        </span>

        <span
          style={{
            fontSize: "10px",
            color: "#94a3b8",
            fontWeight: "700",
          }}
        >
          {progress.currentStationIndex + 1} / {train.route.length} STATIONS
        </span>
      </div>

       
      <button
        onClick={onAdvance}
        disabled={loading || progress.status === "TERMINATED"}
        style={{
          width: "100%",
          background: progress.status === "TERMINATED" ? "#1e293b" : "#1d4ed8",
          color: "white",
          border: "none",
          padding: "12px",
          borderRadius: "8px",
          fontWeight: "700",
          fontSize: "13px",
          cursor:
            loading || progress.status === "TERMINATED"
              ? "not-allowed"
              : "pointer",
        }}
      >
        {loading
          ? "Advancing..."
          : progress.status === "TERMINATED"
            ? "✓ Journey Complete"
            : `▶ ADVANCE TO NEXT STATION (${
                progress.nextStation || "Terminal"
              })`}
      </button>

    
      <style jsx>{`
        @media (max-width: 700px) {
          .train-route-desktop {
            display: none !important;
          }

          .train-route-mobile {
            display: block !important;
          }

          .train-station-summary {
            grid-template-columns: 1fr !important;
          }
        }

        @media (min-width: 701px) {
          .train-route-mobile {
            display: none !important;
          }
        }

        @media (max-width: 420px) {
          .train-route-mobile {
            padding-left: 2px;
            padding-right: 2px;
          }
        }
      `}</style>
    </div>
  );
}

export default function TTEPage() {
  const router = useRouter();
  const [passengers, setPassengers] = useState([]);
  const [passengersActionCount, setPassengersActionCount] = useState(0);
  const [notifications, setNotifications] = useState([]);
  const [allocations, setAllocations] = useState([]);
  const [progress, setProgress] = useState(null);
  const [train, setTrain] = useState(null);
  const [loading, setLoading] = useState(false);
  const [actionLoading, setActionLoading] = useState(false);
  const [activeTab, setActiveTab] = useState("intents");
  const lastActiveTab = useRef("intents");
  const [continuedPassengers, setContinuedPassengers] = useState({});
  const [resetLoading, setResetLoading] = useState(false);
  const [oneTime, setoneTime] = useState(false);
  const [successMsg, setSuccessMsg] = useState("");
  const [errorMsg, setErrorMsg] = useState("");

  useEffect(() => {
    try {
      const saved = localStorage.getItem("tte-continued-passengers");

      if (saved) {
        setContinuedPassengers(JSON.parse(saved));
      }
    } catch (error) {
      console.error("Failed to restore continued passengers:", error);
    }
  }, []);

  const loadAll = useCallback(async () => {
    setLoading(true);
    try {
      const [passRes, notifRes, allocRes, progRes, trainRes] =
        await Promise.all([
          fetch(`/api/tte/passengers?trainId=${TRAIN_ID}`),
          fetch("/api/notifications?role=TTE"),
          fetch("/api/allocations"),
          fetch(`/api/train-progress?trainId=${TRAIN_ID}`),
          fetch(`/api/trains/${TRAIN_ID}`),
        ]);
      const [passData, notifData, allocData, progData, trainData] =
        await Promise.all([
          passRes.json(),
          notifRes.json(),
          allocRes.json(),
          progRes.json(),
          trainRes.json(),
        ]);
      if (passData.success) setPassengers(passData.data);
      if (notifData.success) setNotifications(notifData.data);
      if (allocData.success) setAllocations(allocData.data);
      if (progData.success) setProgress(progData.data);
      if (trainData.success) setTrain(trainData.data);
    } catch {
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadAll();
  }, [loadAll]);

  useEffect(() => {
    const previousTab = lastActiveTab.current;

    // Only run when the tab actually changes.
    if (previousTab === activeTab) {
      return;
    }

    // Update the remembered tab.
    lastActiveTab.current = activeTab;

    // Notification tab has just become active.
    if (activeTab === "notifications") {
      setoneTime(true);

      // Mark all unread notifications as read
      const markAllRead = async () => {
        const unreadNotifications = notifications.filter(
          (n) => n.status === "UNREAD",
        );

        if (unreadNotifications.length === 0) return;

        await Promise.all(
          unreadNotifications.map((n) =>
            fetch(`/api/notifications/${n.id}/read`, {
              method: "POST",
            }),
          ),
        );

        setNotifications((ns) =>
          ns.map((n) => ({
            ...n,
            status: "READ",
          })),
        );
      };

      markAllRead();
    }

    // We have left the notification tab.
    if (previousTab === "notifications") {
      setoneTime(false);
    }
  }, [activeTab]);

  async function handleConfirmIntent(passenger, isDeboarding = false) {
    setActionLoading(true);
    setErrorMsg("");
    try {
      if (isDeboarding) {
        // DEBOARDING_DUE: verify actual deboarding
        const vacancy = passenger.vacancy;
        if (!vacancy) {
          setErrorMsg("No vacancy found for this passenger");
          return;
        }
        const res = await fetch(
          `/api/vacancies/${vacancy.id}/verify-deboarding`,
          {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              tteId: "TTE-001",
              passengerDeboarded: true,
            }),
          },
        );
        const data = await res.json();
        if (data.success) {
          setSuccessMsg(
            `✅ Passenger deboarded. Vacancy verified. ${data.data.recommendation ? "Allocation recommendation created." : ""}`,
          );
        } else setErrorMsg(data.error);
      } else {
        // Confirm early deboarding intent
        const intent = passenger.intent;
        if (!intent) {
          setErrorMsg("No intent found");
          return;
        }
        const res = await fetch(
          `/api/deboarding-intents/${intent.id}/tte-confirm`,
          {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ tteId: "TTE-001" }),
          },
        );
        const data = await res.json();
        if (data.success) {
          setSuccessMsg(
            "🔒 Early deboarding confirmed and locked. Passenger cannot modify.",
          );
        } else setErrorMsg(data.error);
      }
      await loadAll();
    } catch {
      setErrorMsg("Action failed. Please try again.");
    } finally {
      setActionLoading(false);
    }
  }

  async function handleContinue(passenger, isDeboarding = false) {
    setActionLoading(true);
    setErrorMsg("");
    try {
      if (isDeboarding) {
        const vacancy = passenger.vacancy;
        if (!vacancy) {
          setErrorMsg("No vacancy found");
          return;
        }
        const res = await fetch(
          `/api/vacancies/${vacancy.id}/verify-deboarding`,
          {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              tteId: "TTE-001",
              passengerDeboarded: false,
            }),
          },
        );
        const data = await res.json();
        if (data.success) {
          setSuccessMsg("Passenger still on train. No vacancy created.");
        } else setErrorMsg(data.error);
      } else {
        // Mark intent as cancelled
        const intent = passenger.intent;
        if (!intent) {
          setErrorMsg("No intent found");
          return;
        }
        // Just reload — no cancel endpoint needed for TTE "will continue" scenario
        setSuccessMsg("Noted. Passenger will continue to booked destination.");
      }
      await loadAll();
    } catch {
      setErrorMsg("Action failed.");
    } finally {
      setActionLoading(false);
    }
  }

  async function handleAdvance() {
    setActionLoading(true);

    try {
      while (true) {
        const res = await fetch("/api/train-progress/advance", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            trainId: TRAIN_ID,
          }),
        });

        const data = await res.json();

        if (!data.success) {
          break;
        }

        // Update current station
        setProgress(data.data);

        setSuccessMsg(`🚆 Advanced to ${data.data.currentStation}`);

        // Refresh passengers, notifications, allocations, etc.
        await loadAll();

        // Stop if train reached destination
        if (data.data.status === "TERMINATED") {
          setSuccessMsg(
            `✓ Train reached destination: ${data.data.currentStation}`,
          );
          break;
        }

        // Check for deboarding confirmation notification
        const notifRes = await fetch("/api/notifications?role=TTE");

        const notifData = await notifRes.json();

        if (notifData.success) {
          const confirmationNotification = notifData.data?.find(
            (n) =>
              n.status === "UNREAD" && n.type === "DEBOARDING_VERIFICATION",
          );

          if (
            confirmationNotification &&
            !oneTime &&
            lastActiveTab.current !== "notifications"
          ) {
            setSuccessMsg(
              "🔔 Deboarding confirmation required. Train stopped.",
            );

            // Open notification tab
            setActiveTab("notifications");

            break;
          }
        }

        // Wait 700ms before advancing again
        await new Promise((resolve) => setTimeout(resolve, 700));
      }
    } catch (error) {
      console.error("Auto train advance failed:", error);
    } finally {
      setActionLoading(false);
    }
  }

  async function handleReset() {
    setResetLoading(true);

    try {
      const res = await fetch("/api/demo/reset", {
        method: "POST",
      });

      const data = await res.json();

      if (data.success) {
        // Clear locally remembered "Passenger will continue" decisions
        localStorage.removeItem("tte-continued-passengers");
        setContinuedPassengers({});

        setSuccessMsg("Demo data reset. Seeded state restored.");

        setTimeout(() => {
          setSuccessMsg("");
        }, 3000);

        await loadAll();
      }
    } catch (error) {
      console.error("Demo reset failed:", error);
    } finally {
      setResetLoading(false);
    }
  }

  async function markNotifRead(id) {
    await fetch(`/api/notifications/${id}/read`, {
      method: "POST",
    });

    setNotifications((ns) =>
      ns.map((n) => (n.id === id ? { ...n, status: "READ" } : n)),
    );
  }

  async function markAllNotificationsRead() {
    const unreadNotifications = notifications.filter(
      (n) => n.status === "UNREAD",
    );

    if (unreadNotifications.length === 0) return;

    // Mark all unread notifications on the server
    await Promise.all(
      unreadNotifications.map((n) =>
        fetch(`/api/notifications/${n.id}/read`, {
          method: "POST",
        }),
      ),
    );

    // Update UI immediately
    setNotifications((ns) =>
      ns.map((n) => ({
        ...n,
        status: "READ",
      })),
    );
  }

  const unreadCount = notifications.filter((n) => n.status === "UNREAD").length;
  const pendingPassengers = passengers.filter((p) => {
  const status = p.intent?.status;

  // Passenger already chose to continue → no pending action
  if (continuedPassengers[p.bookingId]) {
    return false;
  }

  // Only these statuses require TTE action
  return status === "DECLARED" || status === "DEBOARDING_DUE";
});
  const urgentNotifs = notifications.filter(
    (n) =>
      n.status === "UNREAD" &&
      ["DEBOARDING_VERIFICATION", "DEBOARDING_APPROACHING"].includes(n.type),
  );

  return (
    <ViewProvider>
      <div className="tte-device" style={{ minHeight: "100vh" }}>
        
        <div className="tte-header">
          <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
            <div
              style={{
                background: "#f97316",
                width: "36px",
                height: "36px",
                borderRadius: "8px",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                fontWeight: "900",
                fontSize: "14px",
                color: "white",
              }}
            >
              TTE
            </div>
            <div>
              <div
                style={{
                  fontWeight: "700",
                  color: "#f1f5f9",
                  fontSize: "14px",
                }}
              >
                TTE DEVICE
              </div>
              <div style={{ fontSize: "11px", color: "#64748b" }}>
                Train {TRAIN_ID.replace("T", "")} ·{" "}
                {progress?.currentStation || "—"}
              </div>
            </div>
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
            
            <button
              className="btn-ghost"
              style={{
                fontSize: "11px",
                color: "#94a3b8",
                borderColor: "#334155",
              }}
              onClick={() => router.push("/search")}
            >
              Passenger App
            </button>
          </div>
        </div>

 
        {progress && (
          <div
            style={{
              background: "#0f172a",
              borderBottom: "1px solid #334155",
              padding: "8px 16px",
              display: "flex",
              gap: "16px",
              fontSize: "12px",
              color: "#94a3b8",
            }}
          >
            <span>🚆 {TRAIN_ID.replace("T", "")}</span>
            <span>
              Current:{" "}
              <strong style={{ color: "#f97316" }}>
                {progress.currentStation}
              </strong>
            </span>
            {progress.nextStation && (
              <span>
                Next:{" "}
                <strong style={{ color: "#94a3b8" }}>
                  {progress.nextStation}
                </strong>
              </span>
            )}
          </div>
        )}

    
        {(successMsg || errorMsg) && (
          <div style={{ padding: "8px 16px" }}>
            {successMsg && (
              <div
                style={{
                  background: "#14532d",
                  border: "1px solid #22c55e",
                  borderRadius: "8px",
                  padding: "10px 12px",
                  marginBottom: "6px",
                  fontSize: "13px",
                  color: "#4ade80",
                }}
              >
                {successMsg}
                <button
                  onClick={() => setSuccessMsg("")}
                  style={{
                    float: "right",
                    background: "none",
                    border: "none",
                    color: "#4ade80",
                    cursor: "pointer",
                  }}
                >
                  ✕
                </button>
              </div>
            )}
            {errorMsg && (
              <div
                style={{
                  background: "#450a0a",
                  border: "1px solid #ef4444",
                  borderRadius: "8px",
                  padding: "10px 12px",
                  marginBottom: "6px",
                  fontSize: "13px",
                  color: "#fca5a5",
                }}
              >
                {errorMsg}
                <button
                  onClick={() => setErrorMsg("")}
                  style={{
                    float: "right",
                    background: "none",
                    border: "none",
                    color: "#fca5a5",
                    cursor: "pointer",
                  }}
                >
                  ✕
                </button>
              </div>
            )}
          </div>
        )}

       
        {urgentNotifs.length > 0 && (
          <div
            style={{
              background: "#431407",
              borderBottom: "2px solid #f97316",
              padding: "10px 16px",
            }}
          >
            {urgentNotifs.slice(0, 2).map((n) => (
              <div
                key={n.id}
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                  marginBottom: "4px",
                }}
              >
                <div>
                  <div
                    style={{
                      fontWeight: "700",
                      color: "#f97316",
                      fontSize: "13px",
                    }}
                  >
                    {n.title}
                  </div>
                  <div style={{ fontSize: "11px", color: "#fed7aa" }}>
                    {n.message}
                  </div>
                </div>
                <button
                  onClick={() => markNotifRead(n.id)}
                  style={{
                    background: "none",
                    border: "1px solid #f97316",
                    color: "#f97316",
                    padding: "4px 8px",
                    borderRadius: "4px",
                    cursor: "pointer",
                    fontSize: "11px",
                  }}
                >
                  Dismiss
                </button>
              </div>
            ))}
          </div>
        )}

          
        <div
          className="tte-tabs"
          style={{
            borderBottom: "1px solid #334155",
            display: "flex",
            width: "100%",
            padding: "0 16px",
            boxSizing: "border-box",
          }}
        >
          {[
            {
              key: "intents",
              label: "Deboarding Intents",
              mobileLabel: "Intents",
              badge: pendingPassengers.length,
            },
            {
              key: "train",
              label: "Train Simulator",
              mobileLabel: "Train",
            },
            {
              key: "notifications",
              label: "Notifications",
              mobileLabel: "Notifications",
              badge: unreadCount,
            },
            {
              key: "allocations",
              label: "Allocations",
              mobileLabel: "Allocations",
              badge: allocations.length,
            },
          ].map((tab) => (
            <button
              key={tab.key}
              onClick={() => setActiveTab(tab.key)}
              style={{
                flex: "1 1 0",
                minWidth: 0,
                background: "none",
                border: "none",
                borderBottom: `3px solid ${
                  activeTab === tab.key ? "#f97316" : "transparent"
                }`,
                color: activeTab === tab.key ? "#f97316" : "#64748b",
                fontWeight: activeTab === tab.key ? "700" : "500",
                padding: "10px 8px",
                cursor: "pointer",
                fontSize: "12px",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                gap: "4px",
                transition: "color 0.2s",
                whiteSpace: "nowrap",
                minHeight: "40px",
                overflow: "hidden",
              }}
            >
              <span className="tab-label-desktop">{tab.label}</span>

              <span className="tab-label-mobile">{tab.mobileLabel}</span>

              {tab.badge > 0 && <NotifBadge count={tab.badge} />}
            </button>
          ))}
        </div>

        <style jsx>{`
          .tab-label-mobile {
            display: none;
          }

          @media (max-width: 700px) {
            .tte-tabs {
              padding: 0 6px !important;
            }

            .tte-tabs button {
              padding: 10px 4px !important;
              font-size: 11px !important;
              gap: 3px !important;
            }

            .tab-label-desktop {
              display: none;
            }

            .tab-label-mobile {
              display: inline;
            }
          }

          @media (max-width: 380px) {
            .tte-tabs button {
              padding: 10px 2px !important;
              font-size: 10px !important;
            }
          }
        `}</style>

        
        <div style={{ padding: "16px", maxWidth: "900px", margin: "0 auto" }}>
          {activeTab === "intents" && (
            <div>
              <div
                style={{
                  fontSize: "11px",
                  color: "#64748b",
                  fontWeight: "700",
                  letterSpacing: "0.5px",
                  marginBottom: "12px",
                  textTransform: "uppercase",
                }}
              >
                Passengers with Early Deboarding Intent
              </div>
              {loading && (
                <div
                  style={{
                    textAlign: "center",
                    padding: "40px",
                    color: "#64748b",
                  }}
                >
                  <div
                    className="spinner"
                    style={{
                      margin: "0 auto 12px",
                      borderTopColor: "#f97316",
                      borderColor: "#334155",
                    }}
                  />
                  Loading...
                </div>
              )}
              {!loading && pendingPassengers.length === 0 && (
                <div
                  style={{
                    textAlign: "center",
                    padding: "40px",
                    color: "#64748b",
                  }}
                >
                  <div style={{ fontSize: "32px", marginBottom: "8px" }}>
                    📭 
                  </div>
                  <div>No passengers with deboarding intent on this train.</div>
                  <div style={{ fontSize: "12px", marginTop: "8px" }}>
                    Complete a booking with early deboarding to see it here.
                  </div>
                </div>
              )}
              {pendingPassengers.map((p) => (
                <IntentCard
                  key={p.bookingId}
                  passenger={p}
                  onConfirm={handleConfirmIntent}
                  onContinue={handleContinue}
                  loading={actionLoading}
                  willContinue={!!continuedPassengers[p.bookingId]}
                  onMarkContinue={(bookingId) => {
                    setContinuedPassengers((prev) => {
                      const updated = {
                        ...prev,
                        [bookingId]: true,
                      };

                      try {
                        localStorage.setItem(
                          "tte-continued-passengers",
                          JSON.stringify(updated),
                        );
                      } catch (error) {
                        console.error(
                          "Failed to save continued passenger:",
                          error,
                        );
                      }

                      return updated;
                    });
                  }}
                />
              ))}

               
              {allocations.length > 0 && (
                <div style={{ marginTop: "16px" }}>
                  <div
                    style={{
                      fontSize: "11px",
                      color: "#22c55e",
                      fontWeight: "700",
                      letterSpacing: "0.5px",
                      marginBottom: "10px",
                      textTransform: "uppercase",
                    }}
                  >
                    Allocation Recommendations
                  </div>
                  {allocations.map((a) => (
                    <AllocationCard key={a.id} allocation={a} />
                  ))}
                </div>
              )}
            </div>
          )}

          {activeTab === "train" && (
            <div>
              <div
                className="tte-card"
                style={{ marginTop: "16px", border: "1px dashed #475569" }}
              >
                <div
                  style={{
                    fontSize: "11px",
                    color: "#f97316",
                    fontWeight: "700",
                    letterSpacing: "0.5px",
                    marginBottom: "12px",
                  }}
                >
                  🛠️ PROTOTYPE DEMO CONTROLS
                </div>
                <div style={{ display: "flex", gap: "8px", flexWrap: "wrap" }}>
                  <button
                    onClick={handleReset}
                    disabled={resetLoading}
                    style={{
                      background: "#450a0a",
                      border: "1px solid #ef4444",
                      color: "#fca5a5",
                      padding: "8px 14px",
                      borderRadius: "6px",
                      cursor: "pointer",
                      fontSize: "12px",
                      fontWeight: "600",
                    }}
                  >
                    {resetLoading ? "Resetting..." : "🔄 Reset Demo Data"}
                  </button>
                  <button
                    onClick={handleAdvance}
                    disabled={actionLoading}
                    style={{
                      background: "#0c1a3b",
                      border: "1px solid #3b82f6",
                      color: "#93c5fd",
                      padding: "8px 14px",
                      borderRadius: "6px",
                      cursor: "pointer",
                      fontSize: "12px",
                      fontWeight: "600",
                    }}
                  >
                    ⏭ Advance Train Station
                  </button>
                  <button
                    onClick={loadAll}
                    style={{
                      background: "#0f172a",
                      border: "1px solid #334155",
                      color: "#64748b",
                      padding: "8px 14px",
                      borderRadius: "6px",
                      cursor: "pointer",
                      fontSize: "12px",
                      fontWeight: "600",
                    }}
                  >
                    🔃 Refresh Data
                  </button>
                </div>
                <div
                  style={{
                    fontSize: "11px",
                    color: "#475569",
                    marginTop: "10px",
                  }}
                >
                  These controls are for prototype demonstration only and are
                  not part of the production interface.
                </div>
              </div>

              <TrainProgressSimulator
                progress={progress}
                train={train}
                onAdvance={handleAdvance}
                loading={actionLoading}
              />

           
            </div>
          )}

          {activeTab === "notifications" && (
            <div>
              <div
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                  marginBottom: "12px",
                }}
              >
                <div
                  style={{
                    fontSize: "11px",
                    color: "#64748b",
                    fontWeight: "700",
                    textTransform: "uppercase",
                    letterSpacing: "0.5px",
                  }}
                >
                  {unreadCount} unread notifications
                </div>
                <button
                  onClick={async () => {
                    for (const n of notifications.filter(
                      (n) => n.status === "UNREAD",
                    )) {
                      await markNotifRead(n.id);
                    }
                  }}
                  style={{
                    background: "none",
                    border: "1px solid #334155",
                    color: "#64748b",
                    padding: "4px 10px",
                    borderRadius: "4px",
                    cursor: "pointer",
                    fontSize: "11px",
                  }}
                >
                  Mark all read
                </button>
              </div>
              {notifications.length === 0 && (
                <div
                  style={{
                    textAlign: "center",
                    padding: "40px",
                    color: "#64748b",
                  }}
                >
                  No notifications
                </div>
              )}
              {notifications.map((n) => (
                <div
                  key={n.id}
                  className="tte-card"
                  style={{
                    border:
                      n.status === "UNREAD"
                        ? "1px solid #475569"
                        : "1px solid #1e293b",
                    opacity: n.status === "READ" ? 0.6 : 1,
                    marginBottom: "8px",
                  }}
                >
                  <div
                    style={{
                      display: "flex",
                      justifyContent: "space-between",
                      alignItems: "flex-start",
                    }}
                  >
                    <div style={{ flex: 1 }}>
                      <div
                        style={{
                          fontWeight: "700",
                          color: "#f1f5f9",
                          fontSize: "13px",
                          marginBottom: "4px",
                        }}
                      >
                        {n.title}
                      </div>
                      <div
                        style={{
                          fontSize: "12px",
                          color: "#94a3b8",
                          lineHeight: 1.5,
                        }}
                      >
                        {n.message}
                      </div>
                      <div
                        style={{
                          fontSize: "10px",
                          color: "#475569",
                          marginTop: "4px",
                        }}
                      >
                        {new Date(n.createdAt).toLocaleString()} · {n.type}
                      </div>
                    </div>
                    {n.status === "UNREAD" && (
                      <button
                        onClick={() => markNotifRead(n.id)}
                        style={{
                          background: "none",
                          border: "1px solid #334155",
                          color: "#64748b",
                          padding: "3px 8px",
                          borderRadius: "4px",
                          cursor: "pointer",
                          fontSize: "10px",
                          marginLeft: "8px",
                        }}
                      >
                        Read
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}

          {activeTab === "allocations" && (
            <div>
              <div
                style={{
                  fontSize: "11px",
                  color: "#64748b",
                  fontWeight: "700",
                  textTransform: "uppercase",
                  letterSpacing: "0.5px",
                  marginBottom: "12px",
                }}
              >
                Allocation Recommendations
              </div>
              {allocations.length === 0 && (
                <div
                  style={{
                    textAlign: "center",
                    padding: "40px",
                    color: "#64748b",
                  }}
                >
                  <div style={{ fontSize: "32px", marginBottom: "8px" }}>
                    📋
                  </div>
                  <div>No allocation recommendations yet.</div>
                  <div style={{ fontSize: "12px", marginTop: "8px" }}>
                    Verify a passenger deboarding to generate recommendations.
                  </div>
                </div>
              )}
              {allocations.map((a) => (
                <AllocationCard key={a.id} allocation={a} />
              ))}

              {allocations.length > 0 && (
                <div
                  style={{
                    marginTop: "16px",
                    padding: "12px",
                    background: "#0f172a",
                    borderRadius: "8px",
                    border: "1px solid #1e293b",
                    fontSize: "11px",
                    color: "#475569",
                    lineHeight: 1.5,
                  }}
                >
                  ⚠️ Recommendation only — Final allocation would follow Railway
                  rules and the authorized PRS/HHT workflow. This prototype does
                  not replace IRCTC, PRS, CRIS, HHT, TTE authority, or Railway
                  rules.
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </ViewProvider>
  );
}
