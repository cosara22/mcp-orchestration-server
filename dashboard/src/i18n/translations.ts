export const translations = {
    en: {
        // Sidebar
        appName: 'MCP Dashboard',
        overview: 'Overview',
        metrics: 'Metrics',
        logs: 'Logs',
        traces: 'Traces',
        settings: 'Settings',

        // Dashboard
        systemOverview: 'System Overview',
        systemOverviewDesc: 'Real-time monitoring of MCP orchestration cluster',
        systemHealthy: 'System HEALTHY',
        systemDegraded: 'System DEGRADED',
        systemCritical: 'System CRITICAL',
        activeAgents: 'Active Agents',
        connectedToOrchestrator: 'Connected to orchestrator',
        successRate: 'Success Rate',
        tasksCompleted: 'tasks completed',
        avgTaskDuration: 'Avg Task Duration',
        lastHourAvg: 'Last 1 hour rolling avg',
        failedTasks: 'Failed Tasks',
        requiringAttention: 'Requiring attention',
        taskThroughput: 'Task Throughput (TPM)',
        systemStats: 'System Stats',
        totalTasks: 'Total Tasks',
        pendingTasks: 'Pending Tasks',
        queueDepthNormal: 'Queue depth normal',

        // Metrics
        advancedMetrics: 'Advanced Metrics',
        advancedMetricsDesc: 'Deep dive into performance and agent behavior',
        taskExecutionStatus: 'Task Execution Status (24h)',
        workloadByAgent: 'Workload by Agent Type',
        taskLatency: 'Task Latency (ms) - P95',
        completed: 'Completed',
        failed: 'Failed',

        // Logs
        systemLogs: 'System Logs',
        systemLogsDesc: 'Search and analyze execution logs',
        searchPlaceholder: 'Search logs, trace_id, or task_id...',
        allLevels: 'All Levels',
        info: 'Info',
        warn: 'Warn',
        error: 'Error',
        timestamp: 'Timestamp',
        level: 'Level',
        message: 'Message',
        traceId: 'Trace ID',
        showingEvents: 'Showing {{count}} events',
        noLogsFound: 'No logs found matching criteria.',

        // Traces
        distributedTracing: 'Distributed Tracing',
        distributedTracingDesc: 'Visualize task lifecycle and latency',
        enterTraceId: 'Enter Trace ID (e.g., trace-xyz...)',
        analyze: 'Analyze',
        total: 'Total',

        // Settings
        settingsPage: 'Settings',
        settingsDesc: 'Configure dashboard preferences',
        languageSettings: 'Language Settings',
        languageSettingsDesc: 'Choose your preferred language for the dashboard',
        selectLanguage: 'Select Language',
        english: 'English',
        japanese: '日本語 (Japanese)',
        languageChangedSuccess: 'Language changed successfully',

        // Common
        loading: 'Loading...',
        loadingDashboard: 'Loading dashboard...',
        failedToLoad: 'Failed to load metrics',
    },
    ja: {
        // Sidebar
        appName: 'MCPダッシュボード',
        overview: '概要',
        metrics: 'メトリクス',
        logs: 'ログ',
        traces: 'トレース',
        settings: '設定',

        // Dashboard
        systemOverview: 'システム概要',
        systemOverviewDesc: 'MCPオーケストレーションクラスタのリアルタイム監視',
        systemHealthy: 'システム 正常',
        systemDegraded: 'システム 低下',
        systemCritical: 'システム 重大',
        activeAgents: 'アクティブエージェント',
        connectedToOrchestrator: 'オーケストレーターに接続中',
        successRate: '成功率',
        tasksCompleted: 'タスク完了',
        avgTaskDuration: '平均タスク処理時間',
        lastHourAvg: '直近1時間の移動平均',
        failedTasks: '失敗タスク',
        requiringAttention: '要注意',
        taskThroughput: 'タスクスループット (TPM)',
        systemStats: 'システム統計',
        totalTasks: '総タスク数',
        pendingTasks: '保留中タスク',
        queueDepthNormal: 'キュー深度正常',

        // Metrics
        advancedMetrics: '詳細メトリクス',
        advancedMetricsDesc: 'パフォーマンスとエージェント動作の詳細分析',
        taskExecutionStatus: 'タスク実行ステータス (24時間)',
        workloadByAgent: 'エージェントタイプ別ワークロード',
        taskLatency: 'タスクレイテンシー (ms) - P95',
        completed: '完了',
        failed: '失敗',

        // Logs
        systemLogs: 'システムログ',
        systemLogsDesc: 'ログの検索と分析',
        searchPlaceholder: 'ログ、trace_id、task_idを検索...',
        allLevels: 'すべてのレベル',
        info: '情報',
        warn: '警告',
        error: 'エラー',
        timestamp: 'タイムスタンプ',
        level: 'レベル',
        message: 'メッセージ',
        traceId: 'トレースID',
        showingEvents: '{{count}} 件のイベントを表示中',
        noLogsFound: '条件に一致するログが見つかりません。',

        // Traces
        distributedTracing: '分散トレーシング',
        distributedTracingDesc: 'タスクライフサイクルとレイテンシーの可視化',
        enterTraceId: 'トレースIDを入力 (例: trace-xyz...)',
        analyze: '分析',
        total: '合計',

        // Settings
        settingsPage: '設定',
        settingsDesc: 'ダッシュボードの設定を構成',
        languageSettings: '言語設定',
        languageSettingsDesc: 'ダッシュボードの表示言語を選択してください',
        selectLanguage: '言語を選択',
        english: 'English (英語)',
        japanese: '日本語',
        languageChangedSuccess: '言語が正常に変更されました',

        // Common
        loading: '読み込み中...',
        loadingDashboard: 'ダッシュボードを読み込み中...',
        failedToLoad: 'メトリクスの読み込みに失敗しました',
    },
};

export type Language = keyof typeof translations;
export type TranslationKey = keyof typeof translations.en;
