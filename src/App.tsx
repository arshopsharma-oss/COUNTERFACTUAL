import { useEffect, useState } from "react";
import { io } from "socket.io-client";
import {
  Activity, Atom, ArrowUpRight, ArrowDownRight, GitBranch,
  Users, MessageSquare, X, RotateCcw, Radio, Shield,
  Globe2,
  Sparkles,
} from "lucide-react";
import { generateParallelFutures } from "./engine/parallelFutures";
import type { FutureBranch } from "./engine/parallelFutures";
import { INITIAL_COLONY_STATE } from "./engine/scenarios/mars-colony";
import { exploreWhatIf, type WhatIfBranch } from "./engine/whatIf";
import "./App.css";

const futures = generateParallelFutures();
const socket = io(`http://${window.location.hostname}:3001`, { autoConnect: false });

const resources = [
  { key: "oxygen", label: "OXYGEN", unit: "Oâ‚‚" },
  { key: "food", label: "FOOD RESERVES", unit: "BIO" },
  { key: "energy", label: "ENERGY", unit: "PWR" },
  { key: "water", label: "WATER", unit: "Hâ‚‚O" },
  { key: "morale", label: "CREW MORALE", unit: "HUM" },
  { key: "integrity", label: "STRUCTURAL INTEGRITY", unit: "STR" },
] as const;

function App() {
  const [selected, setSelected] = useState<FutureBranch>(futures[0]);
  const [comparison, setComparison] = useState(false);
  const [warRoom, setWarRoom] = useState(false);
  const [messages, setMessages] = useState([
    { name: "SYSTEM", text: "War Room initialized. Waiting for participants." }
  ]);
  const [message, setMessage] = useState("");
  const [whatIfPrompt, setWhatIfPrompt] = useState("");
  const [whatIfResults, setWhatIfResults] = useState<WhatIfBranch[]>([]);
  const [archive, setArchive] = useState<{prompt:string; results:WhatIfBranch[]}[]>(() => { try { return JSON.parse(localStorage.getItem("cf-archive") || "[]"); } catch { return []; } });

  const [name, setName] = useState("");
  const [joinCode, setJoinCode] = useState("");
  const [roomCode, setRoomCode] = useState("");
  const [participants, setParticipants] = useState<{id:string;name:string}[]>([]);
  const [connection, setConnection] = useState("DISCONNECTED");

  useEffect(() => {
    const onConnect = () => setConnection("CONNECTED");
    const onDisconnect = () => setConnection("DISCONNECTED");
    const onParticipants = (list: {id:string;name:string}[]) => setParticipants(list);
    const onMessage = (msg: {name:string;text:string}) =>
      setMessages(prev => [...prev, msg]);

    socket.on("connect", onConnect);
    socket.on("disconnect", onDisconnect);
    socket.on("participants", onParticipants);
    socket.on("new-message", onMessage);

    return () => {
      socket.off("connect", onConnect);
      socket.off("disconnect", onDisconnect);
      socket.off("participants", onParticipants);
      socket.off("new-message", onMessage);
    };
  }, []);

  const createRoom = () => {
    if (!name.trim()) return alert("Enter your name first");
    socket.connect();
    socket.emit("create-room", {name}, (result: any) => {
      if (result.error) return alert(result.error);
      setRoomCode(result.code);
      setParticipants(result.participants);
      setMessages([{name:"SYSTEM",text:"War Room created successfully."}]);
    });
  };

  const joinRoom = () => {
    if (!name.trim() || !joinCode.trim()) return alert("Enter name and room code");
    socket.connect();
    socket.emit("join-room", {code:joinCode.trim(),name}, (result: any) => {
      if (result.error) return alert(result.error);
      setRoomCode(result.code);
      setParticipants(result.participants);
      setMessages([{name:"SYSTEM",text:"Successfully joined the War Room."}]);
    });
  };

  const sendMessage = () => {
    if (!message.trim() || !roomCode) return;
    socket.emit("send-message", {code:roomCode,name,text:message.trim()});
    setMessage("");
  };

  const reset = () => {
    setSelected(futures[0]);
    setComparison(false);
  };

  const saveExperiment = () => {
    if (!whatIfPrompt.trim() || !whatIfResults.length) return;
    const next = [{ prompt: whatIfPrompt, results: whatIfResults }, ...archive].slice(0, 12);
    setArchive(next);
    localStorage.setItem("cf-archive", JSON.stringify(next));
  };
  const runWhatIf = () => {
    if (!whatIfPrompt.trim()) return;
    setWhatIfResults(exploreWhatIf(whatIfPrompt.trim()));
  };


  return (
    <main className="universe">
      <div className="star-field" />
      <div className="ambient ambient-one" />
      <div className="ambient ambient-two" />

      <header className="topbar">
        <div className="identity">
          <div className="identity-mark"><Atom size={24} /></div>
          <div>
            <div className="brand-name">COUNTER<span>FACTUAL</span></div>
            <div className="brand-sub">A LABORATORY OF ALTERNATE REALITIES</div>
          </div>
        </div>

        <div className="environment">
          <span className="status-light" />
          SIMULATION ENVIRONMENT <span className="separator">/</span> MARS-01
        </div>

        <div className="top-actions">
          <button className="top-button" onClick={() => setComparison(!comparison)}>
            <GitBranch size={15} /> COMPARE
          </button>
          <button className="room-button" onClick={() => setWarRoom(true)}>
            <Users size={15} /> WAR ROOM <span className="room-count">04</span>
          </button>
        </div>
      </header>

      <section className="hero">
        <div className="hero-copy">
          <div className="eyebrow"><span /> EXPLORE THE UNWRITTEN</div>
          <h1>ONE REALITY.<br /><span>INFINITE</span> POSSIBILITIES.</h1>
          <p>
            Every decision creates a different tomorrow.
            Explore the paths reality never took.
          </p>
        </div>

        <div className="hero-meta">
          <div className="meta-label">CURRENT EXPERIMENT</div>
          <div className="experiment-name">THE MARS COLONY</div>
          <div className="experiment-detail">01 / DUST STORM CRISIS</div>
          <div className="meta-line" />
          <div className="meta-status"><span /> MODEL READY</div>
        </div>
      </section>

      <section className="scenario-strip">
        <div className="scenario-icon"><Globe2 size={19} /></div>
        <div className="scenario-text">
          <span>REALITY 001 â€” INITIAL CONDITIONS</span>
          <strong>A massive dust storm is approaching the Mars colony.</strong>
        </div>
        <div className="scenario-right">
          <span>SIMULATION TYPE</span>
          <strong>FICTIONAL SCENARIO</strong>
        </div>
      </section>

      <section className="whatif-lab">
        <div className="whatif-heading">
          <div>
            <div className="section-kicker">EXPERIMENT  /  00</div>
            <h2>What if <span>reality changed?</span></h2>
            <p>Introduce a hypothetical event. Explore four different consequence paths.</p>
          </div>
          <div className="whatif-symbol"><Atom size={28} /></div>
        </div>

        <div className="whatif-input-row">
          <input
            value={whatIfPrompt}
            onChange={event => setWhatIfPrompt(event.target.value)}
            onKeyDown={event => event.key === "Enter" && runWhatIf()}
            placeholder="What if humans discovered life on Europa..."
            maxLength={240}
          />
          <button onClick={runWhatIf}><Sparkles size={15} /> EXPLORE REALITIES</button>
        </div>

        {whatIfResults.length > 0 && (
          <div className="whatif-results">
            <div className="whatif-result-label">
              <span>FOUR GENERATED PATHS</span>
              <small>{whatIfPrompt}</small>
            </div>
            <div className="whatif-grid">
              {whatIfResults.map(branch => (
                <article className="whatif-card" key={branch.id}>
                  <div className="whatif-card-top">
                    <span>{branch.title}</span>
                    <strong>{branch.score}</strong>
                  </div>
                  <p>{branch.consequence}</p>
                  <div className="whatif-assumption">
                    <span>MODEL ASSUMPTION</span>
                    {branch.assumption}
                  </div>
                </article>
              ))}
            </div>
            <div className="whatif-disclaimer">
              EXPLORATORY SCENARIOS · NOT REAL-WORLD PREDICTIONS
              <button className="archive-save" onClick={saveExperiment}>＋ SAVE TO ARCHIVE</button>
            </div>
          </div>
        )}
      </section>
      <section className="archive-section">
        <div className="section-kicker">EXPERIMENT MEMORY / 06</div>
        <h2>Reality <span>Archive.</span></h2>
        <p>Your saved windows into alternate realities.</p>
        {archive.length === 0 ? (
          <div className="archive-empty">NO REALITIES ARCHIVED YET — CREATE AN EXPERIMENT AND SAVE IT.</div>
        ) : (
          <div className="archive-grid">
            {archive.map((item, index) => (
              <button className="archive-card" key={index} onClick={() => {
                setWhatIfPrompt(item.prompt);
                setWhatIfResults(item.results);
              }}>
                <span>ARCHIVED REALITY / 0{index + 1}</span>
                <strong>{item.prompt}</strong>
                <small>FOUR ALTERNATE PATHS · OPEN REALITY ↗</small>
              </button>
            ))}
          </div>
        )}
      </section>
      <section className="workspace">
        <div className="graph-panel">
          <div className="panel-heading">
            <div>
              <div className="section-kicker">01 / DECISION SPACE</div>
              <h2>Reality Graph</h2>
            </div>
            <div className="live-tag"><span /> LIVE MODEL</div>
          </div>

          <div className="graph-stage">
            <div className="graph-orbit orbit-one" />
            <div className="graph-orbit orbit-two" />
            <div className="graph-orbit orbit-three" />

            <svg className="graph-lines" viewBox="0 0 700 430" preserveAspectRatio="none">
              <path d="M350 215 C260 215 245 95 115 95" />
              <path d="M350 215 C285 215 265 175 115 175" />
              <path d="M350 215 C285 215 265 270 115 270" />
              <path d="M350 215 C260 215 245 350 115 350" />
              <path d="M350 215 C440 215 455 95 585 95" />
              <path d="M350 215 C415 215 435 175 585 175" />
              <path d="M350 215 C415 215 435 270 585 270" />
              <path d="M350 215 C440 215 455 350 585 350" />
            </svg>

            <div className="reality-core">
              <div className="core-ring"><Atom size={35} /></div>
              <span>ORIGIN POINT</span>
              <strong>REALITY</strong>
              <small>ONE STARTING STATE</small>
            </div>

            {futures.map((future, index) => (
              <button
                key={future.id}
                className={`future-node node-${index + 1} ${selected.id === future.id ? "active" : ""}`}
                onClick={() => setSelected(future)}
              >
                <span className="node-number">0{index + 1}</span>
                <span className="node-title">{future.title}</span>
                <span className="node-score">{future.survivalScore}% MODEL SCORE</span>
              </button>
            ))}

            <div className="graph-caption">
              <span className="caption-dot" /> FOUR ALTERNATIVE PATHS GENERATED
            </div>
          </div>

          <div className="graph-footer">
            <span><span className="legend-dot origin" /> ORIGIN REALITY</span>
            <span><span className="legend-dot branch" /> ALTERNATE FUTURE</span>
            <span><span className="legend-dot selected-dot" /> SELECTED BRANCH</span>
          </div>
        </div>

        <aside className="analysis-panel">
          <div className="panel-heading">
            <div>
              <div className="section-kicker">02 / CAUSAL INTELLIGENCE</div>
              <h2>Branch Analysis</h2>
            </div>
            <Activity size={19} className="muted-icon" />
          </div>

          <div className="selected-label">SELECTED ALTERNATE REALITY</div>
          <h3 className="branch-title">{selected.title}</h3>
          <p className="branch-description">{selected.description}</p>

          <div className="score-container">
            <div>
              <span className="score-caption">COLONY SURVIVAL SCORE</span>
              <div className="score-number">{selected.survivalScore}<small>/100</small></div>
            </div>
            <div className="score-orbit">
              <div className="score-orbit-inner">{selected.survivalScore}%</div>
            </div>
          </div>

          <div className="causal-heading">
            <Sparkles size={14} /> CAUSAL CHAIN
          </div>

          <div className="causal-list">
            {selected.causalExplanation.map((item, index) => (
              <div className="causal-item" key={index}>
                <span className="causal-index">0{index + 1}</span>
                <p>{item}</p>
              </div>
            ))}
          </div>

          <button className="compare-button" onClick={() => setComparison(true)}>
            EXPLORE THIS REALITY <ArrowUpRight size={16} />
          </button>
        </aside>
      </section>

      <section className="lower-grid">
        <div className="resource-panel">
          <div className="panel-heading">
            <div>
              <div className="section-kicker">03 / SYSTEM VARIABLES</div>
              <h2>Colony State</h2>
            </div>
            <span className="state-label">SELECTED FUTURE</span>
          </div>

          <div className="resource-grid">
            {resources.map(resource => {
              const key = resource.key;
              const value = selected.state[key];
              const change = selected.state[key] - INITIAL_COLONY_STATE[key];

              return (
                <div className="resource-item" key={key}>
                  <div className="resource-top">
                    <span>{resource.label}</span>
                    <small>{resource.unit}</small>
                  </div>
                  <div className="resource-value">{value}<small>%</small></div>
                  <div className="resource-track">
                    <div className="resource-fill" style={{ width: `${value}%` }} />
                  </div>
                  <div className={`resource-change ${change >= 0 ? "positive" : "negative"}`}>
                    {change >= 0 ? <ArrowUpRight size={13} /> : <ArrowDownRight size={13} />}
                    {change > 0 ? "+" : ""}{change} FROM ORIGIN
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        <div className="mars-panel">
          <div className="mars-video">
            <video
              src="/assets/Futuristic_city_on_Mars_7091c1b1.mp4"
              autoPlay
              muted
              loop
              playsInline
            />
            <div className="video-overlay" />
            <div className="video-top"><span /> REMOTE VISUAL FEED</div>
            <div className="video-bottom">
              <strong>MARS / SURFACE 01</strong>
              <span>VISUAL REFERENCE ONLY</span>
            </div>
          </div>
          <div className="mars-caption">
            <Shield size={15} />
            <span>ENVIRONMENTAL MONITORING</span>
            <span className="monitor-status">SIMULATED</span>
          </div>
        </div>
      </section>

      <footer className="footer">
        <div><Radio size={14} /> COUNTERFACTUAL <span>RESEARCH ENVIRONMENT</span></div>
        <div className="footer-center">A DIFFERENT CHOICE. A DIFFERENT UNIVERSE.</div>
        <button onClick={reset}><RotateCcw size={13} /> RESET EXPERIMENT</button>
      </footer>

      {comparison && (
        <div className="modal-backdrop" onClick={() => setComparison(false)}>
          <section className="modal comparison-modal" onClick={e => e.stopPropagation()}>
            <button className="modal-close" onClick={() => setComparison(false)}><X /></button>
            <div className="section-kicker">04 / COUNTERFACTUAL COMPARISON</div>
            <h2>Four possible outcomes.</h2>
            <p className="modal-subtitle">Compare the modelled outcomes of four different decisions.</p>
            <div className="comparison-table">
              <div className="comparison-row table-head">
                <span>ALTERNATE FUTURE</span><span>SURVIVAL SCORE</span><span>ENERGY</span><span>WATER</span>
              </div>
              {futures.map(future => (
                <button
                  className={`comparison-row ${selected.id === future.id ? "current-row" : ""}`}
                  key={future.id}
                  onClick={() => { setSelected(future); setComparison(false); }}
                >
                  <span>{future.title}</span>
                  <strong>{future.survivalScore}/100</strong>
                  <span>{future.state.energy}%</span>
                  <span>{future.state.water}%</span>
                </button>
              ))}
            </div>
            <div className="model-disclaimer">
              <Shield size={15} /> These are outcomes of a simplified fictional model, not real-world predictions.
            </div>
          </section>
        </div>
      )}

      {warRoom && (
        <div className="modal-backdrop" onClick={() => setWarRoom(false)}>
          <section className="modal war-modal" onClick={e => e.stopPropagation()}>
            <button className="modal-close" onClick={() => setWarRoom(false)}><X /></button>
            <div className="section-kicker">05 / COLLABORATIVE SPACE</div>
            <h2><Users size={24} /> The War Room</h2>
            <p className="modal-subtitle">A shared space to discuss alternative realities.</p>
            <div className="room-code">
              ROOM CODE <strong>{roomCode || "NOT CONNECTED"}</strong>
              <span>{connection}</span>
            </div>

            {!roomCode && (
              <div className="chat-input" style={{flexDirection:"column",gap:10}}>
                <input value={name} onChange={e=>setName(e.target.value)} placeholder="Your display name" />
                <button onClick={createRoom}>＋ CREATE NEW ROOM</button>
                <input value={joinCode} onChange={e=>setJoinCode(e.target.value.toUpperCase())} placeholder="Enter 6-character room code" />
                <button onClick={joinRoom}>JOIN EXISTING ROOM ↗</button>
              </div>
            )}

            {roomCode && (
              <>
                <button className="archive-save" onClick={() => navigator.clipboard.writeText(roomCode)}>
                  COPY ROOM CODE
                </button>
                <div className="participant-list">
                  {participants.map(p => (
                    <div key={p.id}>
                      <span className="participant-dot online" /> {p.name}
                      <small> ONLINE</small>
                    </div>
                  ))}
                </div>
                <div className="chat-heading">
                  <MessageSquare size={15}/> ROOM DISCUSSION
                </div>
                <div className="chat-messages">
                  {messages.map((msg,i)=>(
                    <div className="chat-message" key={i}>
                      <strong>{msg.name}</strong><p>{msg.text}</p>
                    </div>
                  ))}
                </div>
                <div className="chat-input">
                  <input value={message} onChange={e=>setMessage(e.target.value)}
                    onKeyDown={e=>e.key==="Enter"&&sendMessage()}
                    placeholder="Share your perspective..." />
                  <button onClick={sendMessage}><ArrowUpRight size={18}/></button>
                </div>
                <div className="room-note">LIVE MULTIPLAYER / ROOM {roomCode}</div>
              </>
            )}
          </section>
        </div>
      )}

      <div className="creator-watermark">CREATED BY <strong>ARSH SHARMA</strong></div>
    </main>
  );
}

export default App;





