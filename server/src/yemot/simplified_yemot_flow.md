\
```mermaid
graph TD
    A["yemot-handler.ts (yemotHandler, CallHandler)"] --> B["handlers/yemot-handler-factory.ts (YemotHandlerFactory)"];
    A --> C["handlers/yemot-flow-orchestrator.ts (YemotFlowOrchestrator)"];
    B -.-> C; subgraph Initialization
    direction LR
    Init1[CallHandler Initializes] --> Init2(YemotHandlerFactory)
    Init1 --> Init3(YemotFlowOrchestrator)
    end

    C --> D{"YemotFlowOrchestrator.execute()"};

    subgraph User Interaction
        direction LR
        D --> E["UserInteractionHandler (handles/user-interaction-handler.ts)"];
        B -- Creates --> E;
        E --> F{"Menu Option Selected"};
    end

    subgraph Event Reporting Flow
        direction LR
        F -- Event Reporting --> G["EventRegistrationHandler (handles/event-registration-handler.ts)"];
        B -- Creates --> G;
        G --> H["DateSelectionHelper (handles/date-selection-helper.ts)"];
        B -- Creates --> H;
        G --> I["VoucherSelectionHandler (handles/voucher-selection-handler.ts)"];
        B -- Creates --> I;
        G --> J["EventPersistenceHandler (handles/event-persistence-handler.ts)"];
        B -- Creates --> J;
    end

    subgraph Path Selection Flow
        direction LR
        F -- Path Selection --> K["ConfigurableEventSelector (handles/configurable-event-selector.ts)"];
        B -- Creates --> K;
        K --> L["SelectionHelper (handles/selection-helper.ts)"];
        K --> J; B -- Creates --> L;
        F -- Path Selection --> M["PathSelectionHandler (handles/path-selection-handler.ts)"];
        B -- Creates --> M; M --> L;
        M --> J;
    end

    subgraph Voucher Selection Flow
        direction LR
        F -- Voucher Selection --> N["ConfigurableEventSelector (handles/configurable-event-selector.ts)"];
        B -- Creates --> N; N --> L;
        N --> J;
        F -- Voucher Selection --> O["VoucherSelectionHandler (handles/voucher-selection-handler.ts)"];
        B -- Creates --> O; O --> L;
        O --> J;
    end

    subgraph Post-Event Update Flow
        direction LR
        F -- Post-Event Update --> P["PostEventUpdateHandler (handles/post-event-update-handler.ts)"];
        B -- Creates --> P;
        P --> K; // Now uses ConfigurableEventSelector
        P --> R["PathSelectionHandler (handles/path-selection-handler.ts)"];
        B -- Creates --> R; R --> L;
        P --> J;
    end

    J --> S["Database (TypeORM Entities)"];

    subgraph Utilities
        direction LR
        U1["utils/call-utils.ts"]
        U2["utils/extended-call.ts"]
        U3["utils/format-utils.ts"]
        U4["utils/event-eligibility.util.ts"]
        U5["core/base-yemot-handler.ts"]
        U6["core/base-selection-handler.ts"]
    end

    E -. uses .-> U1; E -. uses .-> U2; E -. uses .-> U5;
    G -. uses .-> U1; G -. uses .-> U2; G -. uses .-> U3; G -. uses .-> U5;
    H -. uses .-> U1; H -. uses .-> U2; H -. uses .-> U3; H -. uses .-> U5;
    I -. uses .-> L;
    L -. uses .-> U1; L -. uses .-> U2; L -. uses .-> U5;
    M -. uses .-> L;
    O -. uses .-> L;
    P -. uses .-> U1; P -. uses .-> U2; P -. uses .-> U5;
    K -. uses .-> L; K -. uses .-> U4;
    N -. uses .-> L; N -. uses .-> U4;

    style A fill:#f9f,stroke:#333,stroke-width:2px
    style B fill:#ccf,stroke:#333,stroke-width:2px
    style C fill:#lightgreen,stroke:#333,stroke-width:2px
    style L fill:#tan,stroke:#333,stroke-width:1px
    style J fill:#orange,stroke:#333,stroke-width:2px
```
