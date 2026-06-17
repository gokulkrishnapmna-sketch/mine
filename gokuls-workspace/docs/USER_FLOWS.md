# User flows

## 1. Requester submits a design request

```
Homepage / Dashboard
   └─ "Create New Request"
        └─ Structured form (title, description, objective, deliverable,
           deadline, priority, contact, references, files, dependencies)
             │  ▲ live AI assistant: intake score, missing-info, priority,
             │  │ effort — updates as you type
             ▼
           Submit  ──►  validation passes?  ──no──► highlight missing fields
             │ yes
             ▼
           Task created (status: Backlog) ──► activity logged
             └─ Gokul notified (in-app + email)
                  └─ Requester lands on the Task Details page
```

## 2. Gokul triages and works a task

```
Dashboard / Board / Queue
   └─ Open task
        ├─ Set priority ─► queue re-ranks, requester notified
        ├─ Set estimated completion
        ├─ Drag Backlog → In Progress (board)  ─► capacity meter updates
        ├─ Ask a question (comment flagged "Question")
        │     └─ Contact person notified (in-app + email)
        ├─ Upload first draft ─► activity logged
        ├─ Move → Review ─► requester notified
        └─ Move → Completed ─► requester notified, turnaround recorded
```

## 3. Clarification loop

```
Gokul: "@Aisha which gradient?"  (question)
   └─ Aisha notified ─► opens task ─► replies in thread
        └─ Gokul notified ─► continues work
```

## 4. Everyone checks workload (no asking required)

```
"Gokul's Current Work"  (visible to all)
   ├─ Currently working on
   ├─ Waiting for inputs
   ├─ Next in queue
   ├─ Completed this week
   ├─ Average turnaround
   ├─ Capacity meter ("operating at 82% capacity")
   └─ Upcoming deadlines
```

## 5. Admin reviews analytics

```
Analytics (admin only)
   ├─ Created this month / completed / avg completion / busiest week
   ├─ Workload trend (created vs completed, 8 weeks)
   ├─ Tasks by priority (donut)
   ├─ Tasks by department (bar)
   └─ Top requesting departments
```

## Role capabilities

| Capability | Requester | Gokul (Admin) |
| --- | :---: | :---: |
| Create request, upload files/links | ✅ | ✅ |
| View all tasks, queue, workload | ✅ | ✅ |
| Comment / answer questions | ✅ | ✅ |
| Change status / priority | — | ✅ |
| Reorder queue | — | ✅ |
| Set estimated completion / effort | — | ✅ |
| Ask questions (notify contact) | — | ✅ |
| Analytics dashboard | — | ✅ |
