import { useEffect, useMemo, useState } from "react";
import { Button } from "@vibe/core";

const initialGroups = [
  {
    id: "week",
    name: "Esta semana",
    color: "#6c7ae0",
    tasks: [
      { id: 1, name: "Revisar roteiro da campanha de primavera", status: "Em andamento", owner: "LC", ownerName: "Lia Costa", due: "15 out", priority: "Alta" },
      { id: 2, name: "Preparar referências para a nova página", status: "Concluído", owner: "RM", ownerName: "Rafa Melo", due: "16 out", priority: "Normal" },
      { id: 3, name: "Validar textos com a equipe de produto", status: "A fazer", owner: "AV", ownerName: "Ana Vieira", due: "17 out", priority: "Normal" },
    ],
  },
  {
    id: "next",
    name: "Próxima semana",
    color: "#28a879",
    tasks: [
      { id: 4, name: "Montar apresentação para parceiros", status: "A fazer", owner: "RM", ownerName: "Rafa Melo", due: "21 out", priority: "Baixa" },
      { id: 5, name: "Agendar revisão do protótipo", status: "Em andamento", owner: "LC", ownerName: "Lia Costa", due: "22 out", priority: "Alta" },
    ],
  },
];

const statusOptions = ["A fazer", "Em andamento", "Concluído", "Pausado"];
const statusClass = {
  "A fazer": "todo",
  "Em andamento": "progress",
  "Concluído": "done",
  Pausado: "paused",
};

function loadGroups() {
  try {
    const saved = localStorage.getItem("pauta-board-v1");
    return saved ? JSON.parse(saved) : initialGroups;
  } catch {
    return initialGroups;
  }
}

function Avatar({ initials, name }) {
  return <span className={`avatar avatar-${initials.toLowerCase()}`} title={name}>{initials}</span>;
}

function StatusSelect({ value, onChange }) {
  return (
    <select
      aria-label={`Status: ${value}`}
      className={`status-select ${statusClass[value] ?? "todo"}`}
      value={value}
      onChange={(event) => onChange(event.target.value)}
    >
      {statusOptions.map((status) => <option key={status}>{status}</option>)}
    </select>
  );
}

function TaskRow({ task, onStatusChange }) {
  return (
    <div className="task-row">
      <label className="task-name">
        <input type="checkbox" aria-label={`Selecionar ${task.name}`} />
        <span className="task-title">{task.name}</span>
      </label>
      <div className="task-cell status-cell"><StatusSelect value={task.status} onChange={onStatusChange} /></div>
      <div className="task-cell owner-cell"><Avatar initials={task.owner} name={task.ownerName} /><span>{task.ownerName}</span></div>
      <div className="task-cell date-cell"><span className="calendar-icon">▦</span>{task.due || "Definir data"}</div>
      <div className="task-cell priority-cell"><span className={`priority-dot ${task.priority.toLowerCase()}`} />{task.priority}</div>
      <button className="row-menu" aria-label={`Mais opções para ${task.name}`}>···</button>
    </div>
  );
}

export function WorkBoard() {
  const [groups, setGroups] = useState(loadGroups);
  const [view, setView] = useState("table");
  const [query, setQuery] = useState("");
  const [draft, setDraft] = useState("");
  const [collapsed, setCollapsed] = useState({});
  const [notice, setNotice] = useState("");

  useEffect(() => {
    localStorage.setItem("pauta-board-v1", JSON.stringify(groups));
  }, [groups]);

  const total = groups.reduce((sum, group) => sum + group.tasks.length, 0);
  const visibleGroups = useMemo(() => groups.map((group) => ({
    ...group,
    tasks: group.tasks.filter((task) => task.name.toLocaleLowerCase("pt-BR").includes(query.toLocaleLowerCase("pt-BR"))),
  })).filter((group) => group.tasks.length || !query), [groups, query]);

  const changeStatus = (groupId, taskId, status) => {
    setGroups((current) => current.map((group) => group.id !== groupId ? group : {
      ...group,
      tasks: group.tasks.map((task) => task.id === taskId ? { ...task, status } : task),
    }));
  };

  const addTask = (event) => {
    event.preventDefault();
    const name = draft.trim();
    if (!name) return;
    setGroups((current) => current.map((group, index) => index !== 0 ? group : {
      ...group,
      tasks: [...group.tasks, { id: Date.now(), name, status: "A fazer", owner: "AV", ownerName: "Ana Vieira", due: "", priority: "Normal" }],
    }));
    setDraft("");
    setNotice("Tarefa adicionada ao quadro.");
    window.setTimeout(() => setNotice(""), 2500);
  };

  return (
    <div className="app-shell">
      <aside className="sidebar">
        <div className="brand-row"><span className="brand-mark">p</span><span className="brand-name">pauta</span><button className="workspace-switch" aria-label="Trocar espaço">⌄</button></div>
        <button className="workspace-card"><span className="workspace-avatar">A</span><span><b>Ateliê Aurora</b><small>Espaço de trabalho</small></span><span className="chevron">⌄</span></button>
        <nav className="main-nav" aria-label="Navegação principal">
          <button><span className="nav-icon">⌂</span>Início</button>
          <button><span className="nav-icon">◷</span>Minha semana</button>
          <button><span className="nav-icon">▤</span>Minhas tarefas <span className="nav-count">4</span></button>
        </nav>
        <div className="nav-section"><span>ÁREA DE TRABALHO</span><button aria-label="Adicionar área">＋</button></div>
        <div className="workspace-name"><span className="workspace-color" />Marketing <span className="tiny-chevron">⌄</span></div>
        <nav className="board-nav" aria-label="Quadros">
          <button className="selected"><span className="board-icon">▦</span>Lançamentos de produto</button>
          <button><span className="board-icon">▦</span>Calendário editorial</button>
          <button><span className="board-icon">▦</span>Ideias da equipe</button>
          <button className="add-board">＋ Adicionar quadro</button>
        </nav>
        <div className="sidebar-bottom"><button><span className="nav-icon">?</span>Central de ajuda</button><div className="profile"><Avatar initials="LC" name="Lia Costa"/><span><b>Lia Costa</b><small>Plano educacional</small></span><span className="profile-more">···</span></div></div>
      </aside>

      <main className="main-content">
        <header className="topbar">
          <div className="breadcrumb"><span>Marketing</span><span className="crumb-sep">/</span><b>Lançamentos de produto</b><button aria-label="Favoritar quadro">☆</button></div>
          <div className="top-actions"><button className="help-button" aria-label="Ajuda">?</button><Avatar initials="AV" name="Ana Vieira"/><Avatar initials="RM" name="Rafa Melo"/><button className="invite-button">＋ <span>Convidar</span></button></div>
        </header>

        <section className="board-area">
          <div className="board-heading">
            <div><div className="eyebrow">QUADRO DE EQUIPE <span>·</span> {total} TAREFAS</div><h1>Lançamentos de produto <button aria-label="Opções do quadro">⌄</button></h1><p>Planeje, acompanhe e compartilhe o trabalho do time.</p></div>
            <div className="heading-actions"><button className="icon-action" aria-label="Mais opções">···</button><Button size="small">Compartilhar</Button></div>
          </div>

          <div className="view-toolbar">
            <div className="view-tabs" role="tablist" aria-label="Visualização">
              <button role="tab" aria-selected={view === "table"} className={view === "table" ? "active" : ""} onClick={() => setView("table")}><span>▤</span>Tabela</button>
              <button role="tab" aria-selected={view === "kanban"} className={view === "kanban" ? "active" : ""} onClick={() => setView("kanban")}><span>▥</span>Kanban</button>
              <button className="add-view" aria-label="Adicionar visualização">＋</button>
            </div>
            <div className="board-tools">
              <label className="search-box"><span>⌕</span><input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Buscar tarefas" aria-label="Buscar tarefas" />{query && <button onClick={() => setQuery("")} aria-label="Limpar busca">×</button>}</label>
              <button className="tool-button" onClick={() => setNotice("Filtros disponíveis em uma próxima etapa.")}><span>☷</span>Filtrar</button>
              <button className="tool-button hide-narrow" onClick={() => setNotice("Ordenação disponível em uma próxima etapa.")}><span>↕</span>Ordenar</button>
              <button className="tool-button hide-narrow" onClick={() => setNotice("Pessoas do espaço de trabalho.")}><span>♙</span>Pessoas</button>
              <form className="add-task-form" onSubmit={addTask}>
                <input value={draft} onChange={(event) => setDraft(event.target.value)} placeholder="Nova tarefa…" aria-label="Nome da nova tarefa" />
                <Button size="small" type="submit">＋ Novo item</Button>
              </form>
            </div>
          </div>

          <div className="board-content">
            {visibleGroups.map((group) => (
              <section className="task-group" key={group.id}>
                <button className="group-heading" onClick={() => setCollapsed((current) => ({ ...current, [group.id]: !current[group.id] }))} aria-expanded={!collapsed[group.id]}>
                  <span className="group-chevron">{collapsed[group.id] ? "›" : "⌄"}</span><span className="group-bar" style={{ backgroundColor: group.color }} /><strong>{group.name}</strong><span className="group-count">{group.tasks.length}</span>
                </button>
                {!collapsed[group.id] && (view === "table" ? (
                  <div className="task-table">
                    <div className="table-header"><div className="task-name"><span className="checkbox-ghost" />Nome da tarefa</div><div>Status</div><div>Responsável</div><div>Prazo</div><div>Prioridade</div><div /></div>
                    {group.tasks.map((task) => <TaskRow key={task.id} task={task} onStatusChange={(status) => changeStatus(group.id, task.id, status)} />)}
                    <button className="add-row" onClick={() => { setDraft(""); document.querySelector(".add-task-form input")?.focus(); }}>＋ Adicionar tarefa</button>
                  </div>
                ) : (
                  <div className="kanban-grid">
                    {statusOptions.slice(0, 3).map((status) => <div className="kanban-column" key={status}>
                      <div className={`kanban-title ${statusClass[status]}`}><span />{status}<b>{group.tasks.filter((task) => task.status === status).length}</b></div>
                      {group.tasks.filter((task) => task.status === status).map((task) => <article className="kanban-card" key={task.id}><strong>{task.name}</strong><div><Avatar initials={task.owner} name={task.ownerName}/><span>{task.due || "Sem prazo"}</span></div></article>)}
                      <button className="kanban-add" onClick={() => document.querySelector(".add-task-form input")?.focus()}>＋ Adicionar tarefa</button>
                    </div>)}
                  </div>
                ))}
              </section>
            ))}
            {visibleGroups.length === 0 && <div className="empty-state"><span>⌕</span><h2>Nenhuma tarefa encontrada</h2><p>Tente outro termo de busca.</p></div>}
          </div>
          <footer className="board-footer"><span><span className="footer-dot" />Atualizado agora</span><span>Os dados ficam salvos somente neste navegador</span></footer>
        </section>
      </main>
      {notice && <div className="toast" role="status">{notice}<button onClick={() => setNotice("")} aria-label="Fechar aviso">×</button></div>}
    </div>
  );
}
