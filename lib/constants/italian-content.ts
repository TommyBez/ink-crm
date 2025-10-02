/**
 * Italian content constants for the Ink CRM application
 * All user-facing text should reference these constants to ensure consistency
 */

export const italianContent = {
  // Application-wide
  app: {
    name: 'Ink CRM',
    tagline: 'Gestione Consensi per Studi di Tatuaggi',
    loading: 'Caricamento...',
    error: 'Si è verificato un errore',
    retry: 'Riprova',
    cancel: 'Annulla',
    save: 'Salva',
    delete: 'Elimina',
    edit: 'Modifica',
    create: 'Crea',
    search: 'Cerca',
    filter: 'Filtra',
    close: 'Chiudi',
    back: 'Indietro',
    next: 'Avanti',
    previous: 'Precedente',
    confirm: 'Conferma',
    actions: 'Azioni',
    noResults: 'Nessun risultato trovato',
    required: 'Obbligatorio',
    optional: 'Facoltativo',
  },

  // Authentication
  auth: {
    login: 'Accedi',
    logout: 'Esci',
    signUp: 'Registrati',
    forgotPassword: 'Password dimenticata?',
    resetPassword: 'Reimposta password',
    updatePassword: 'Aggiorna password',
    email: 'Email',
    password: 'Password',
    confirmPassword: 'Conferma password',
    rememberMe: 'Ricordami',
    loginSuccess: 'Accesso effettuato con successo',
    logoutSuccess: 'Disconnessione effettuata',
    signUpSuccess:
      "Registrazione completata! Controlla la tua email per confermare l'account.",
    passwordResetSent: 'Email di reset password inviata',
    passwordUpdated: 'Password aggiornata con successo',
    invalidCredentials: 'Credenziali non valide',
    emailRequired: "L'email è obbligatoria",
    passwordRequired: 'La password è obbligatoria',
    passwordMismatch: 'Le password non corrispondono',
    passwordTooShort: 'La password deve contenere almeno 8 caratteri',
    invalidEmail: 'Indirizzo email non valido',
    accountNotFound: 'Account non trovato',
    accountAlreadyExists: 'Un account con questa email esiste già',
    confirmEmail: 'Conferma la tua email',
    confirmEmailSent: 'Email di conferma inviata',
    confirmEmailSuccess: 'Email confermata con successo',
    authError: 'Errore di autenticazione',
  },

  // Studio Dashboard
  studio: {
    title: 'Studio',
    dashboard: 'Dashboard',
    welcome: 'Benvenuto nello Studio',
    overview: 'Panoramica',
    recentForms: 'Moduli Recenti',
    quickActions: 'Azioni Rapide',
    statistics: 'Statistiche',
    formsToday: 'Moduli di oggi',
    formsThisWeek: 'Moduli questa settimana',
    formsThisMonth: 'Moduli questo mese',
    totalForms: 'Totale moduli',
    totalTemplates: 'Totale modelli',
    totalClients: 'Totale clienti',
    noRecentForms: 'Nessun modulo recente',
  },

  // Navigation
  navigation: {
    dashboard: 'Dashboard',
    templates: 'Modelli',
    forms: 'Moduli',
    newForm: 'Nuovo Modulo',
    archive: 'Archivio',
    settings: 'Impostazioni',
    help: 'Aiuto',
    profile: 'Profilo',
  },

  // Templates
  templates: {
    title: 'Modelli',
    subtitle: 'Gestisci i tuoi modelli di consenso',
    createTemplate: 'Crea Modello',
    editTemplate: 'Modifica Modello',
    deleteTemplate: 'Elimina Modello',
    duplicateTemplate: 'Duplica Modello',
    templateName: 'Nome Modello',
    templateDescription: 'Descrizione',
    lastModified: 'Ultima modifica',
    createdDate: 'Data creazione',
    fields: 'Campi',
    preview: 'Anteprima',
    noTemplates: 'Nessun modello trovato',
    createFirst: 'Crea il tuo primo modello',
    deleteConfirm: 'Sei sicuro di voler eliminare questo modello?',
    deleteWarning: 'Questa azione non può essere annullata.',
    templateDeleted: 'Modello eliminato con successo',
    templateSaved: 'Modello salvato con successo',
    templateDuplicated: 'Modello duplicato con successo',
    defaultConsentTitle: 'Modulo di Consenso Standard',
    defaultConsentDescription:
      'Modulo di consenso per tatuaggi conforme alla normativa italiana',
    validation: {
      nameRequired: 'Il nome del modello è obbligatorio',
      atLeastOneField: 'Il modello deve contenere almeno un campo',
      signatureRequired: 'Il modello deve contenere almeno un campo firma',
    },
  },

  // Template Editor
  editor: {
    title: 'Editor Modello',
    subtitle: 'Crea e modifica i tuoi modelli di consenso',
    addField: 'Aggiungi Campo',
    fieldTypes: 'Tipi di Campo',
    fieldProperties: 'Proprietà Campo',
    dragToReorder: 'Trascina per riordinare',
    deleteField: 'Elimina Campo',
    duplicateField: 'Duplica Campo',
    fieldLabel: 'Etichetta',
    placeholder: 'Testo suggerito',
    helpText: 'Testo di aiuto',
    required: 'Campo obbligatorio',
    validationRules: 'Regole di validazione',
    templateInfo: 'Informazioni Modello',
    templateFields: 'Campi del Modello',
    setAsDefault: 'Imposta come modello predefinito',
    noFields: 'Nessun campo aggiunto',
    dragFieldsFromSidebar: 'Trascina i campi dalla barra laterale per iniziare',
    noFieldsInPreview: 'Nessun campo da visualizzare nell\'anteprima',
    fieldLabelPlaceholder: 'Inserisci l\'etichetta del campo',
    templateNamePlaceholder: 'Inserisci il nome del modello',
    templateDescriptionPlaceholder: 'Inserisci una descrizione del modello',
    helpTextPlaceholder: 'Testo di aiuto per l\'utente',
    placeholderPlaceholder: 'Testo suggerito per il campo',
    patternPlaceholder: 'es. [0-9]{10}',
    patternHelp: 'Espressione regolare per validare il formato',
    checkboxTextPlaceholder: 'Testo della casella di controllo',
    checkboxTextHelp: 'Testo che apparirà accanto alla casella di controllo',
    signatureFieldInfo: 'Campo firma - l\'utente potrà firmare digitalmente',
    textFieldPlaceholder: 'Inserisci il testo...',
    checkboxFieldPlaceholder: 'Accetto i termini e le condizioni',
    signatureFieldPlaceholder: 'Area per la firma digitale',
    fieldType: {
      text: 'Testo',
      email: 'Email',
      phone: 'Telefono',
      date: 'Data',
      checkbox: 'Casella di controllo',
      signature: 'Firma',
      textarea: 'Area di testo',
      select: 'Selezione',
      number: 'Numero',
    },
    fieldTypeDescription: {
      text: 'Campo di testo libero',
      date: 'Selettore di data',
      checkbox: 'Casella di controllo',
      signature: 'Campo per firma digitale',
    },
    validation: {
      minLength: 'Lunghezza minima',
      maxLength: 'Lunghezza massima',
      pattern: 'Formato (regex)',
      minValue: 'Valore minimo',
      maxValue: 'Valore massimo',
    },
    minLength: 'Lunghezza minima',
    maxLength: 'Lunghezza massima',
    pattern: 'Formato (regex)',
    minDate: 'Data minima',
    maxDate: 'Data massima',
    checkboxText: 'Testo della casella',
  },

  // Forms
  forms: {
    title: 'Compila Modulo',
    selectTemplate: 'Seleziona un Modello',
    fillForm: 'Compila Modulo',
    clientInfo: 'Informazioni Cliente',
    reviewForm: 'Rivedi Modulo',
    signForm: 'Firma Modulo',
    formCompleted: 'Modulo Completato',
    startNew: 'Inizia Nuovo Modulo',
    saveProgress: 'Salva Progressi',
    clearForm: 'Cancella Modulo',
    validation: {
      fillAllRequired: 'Compila tutti i campi obbligatori',
      invalidEmail: 'Indirizzo email non valido',
      invalidPhone: 'Numero di telefono non valido',
      invalidDate: 'Data non valida',
      signatureRequired: 'La firma è obbligatoria',
      fieldRequired: 'Questo campo è obbligatorio',
    },
    autoSaved: 'Salvato automaticamente',
    savingProgress: 'Salvataggio in corso...',
  },

  // Signature
  signature: {
    title: 'Firma',
    clear: 'Cancella',
    undo: 'Annulla',
    sign: 'Firma qui',
    signatureRequired: 'La firma è obbligatoria',
    touchToSign: 'Tocca per firmare',
    clickToSign: 'Clicca per firmare',
    signatureCleared: 'Firma cancellata',
  },

  // PDF
  pdf: {
    title: 'Anteprima PDF',
    generating: 'Generazione PDF...',
    preview: 'Anteprima',
    download: 'Scarica',
    print: 'Stampa',
    save: 'Salva',
    archive: 'Archivia',
    zoom: 'Zoom',
    zoomIn: 'Ingrandisci',
    zoomOut: 'Riduci',
    fitToPage: 'Adatta alla pagina',
    page: 'Pagina',
    of: 'di',
    generationError: 'Errore nella generazione del PDF',
    downloadError: 'Errore nel download del PDF',
    metadata: {
      title: 'Modulo di Consenso',
      subject: 'Consenso Informato',
      creator: 'Ink CRM',
      keywords: 'consenso, tatuaggio, modulo',
    },
  },

  // Archive
  archive: {
    title: 'Archivio',
    subtitle: 'Cerca e visualizza i moduli archiviati',
    searchPlaceholder: 'Cerca per nome cliente...',
    filters: 'Filtri',
    dateRange: 'Periodo',
    fromDate: 'Da',
    toDate: 'A',
    template: 'Modello',
    allTemplates: 'Tutti i modelli',
    sortBy: 'Ordina per',
    sortDate: 'Data',
    sortName: 'Nome',
    sortTemplate: 'Modello',
    ascending: 'Crescente',
    descending: 'Decrescente',
    view: 'Visualizza',
    download: 'Scarica',
    bulkDownload: 'Scarica Selezione',
    exportList: 'Esporta Lista',
    noDocuments: 'Nessun documento trovato',
    documentsFound: '{count} documenti trovati',
    loadMore: 'Carica altri',
    archiveSuccess: 'Documento archiviato con successo',
    archiveError: "Errore nell'archiviazione del documento",
    downloadSuccess: 'Download completato',
    downloadError: 'Errore nel download',
    accessDenied: 'Accesso negato',
    documentNotFound: 'Documento non trovato',
  },

  // Settings
  settings: {
    title: 'Impostazioni',
    studio: 'Studio',
    account: 'Account',
    team: 'Team',
    billing: 'Fatturazione',
    notifications: 'Notifiche',
    security: 'Sicurezza',
    studioName: 'Nome Studio',
    studioAddress: 'Indirizzo',
    studioPhone: 'Telefono',
    studioEmail: 'Email',
    studioWebsite: 'Sito Web',
    save: 'Salva Impostazioni',
    saved: 'Impostazioni salvate',
    changePassword: 'Cambia Password',
    twoFactorAuth: 'Autenticazione a due fattori',
    enable2FA: 'Abilita 2FA',
    disable2FA: 'Disabilita 2FA',
    inviteTeamMember: 'Invita Membro del Team',
    teamMembers: 'Membri del Team',
    role: 'Ruolo',
    permissions: 'Permessi',
    removeUser: 'Rimuovi Utente',
    subscription: 'Abbonamento',
    plan: 'Piano',
    usage: 'Utilizzo',
    upgrade: 'Aggiorna',
  },

  // Roles
  roles: {
    owner: 'Proprietario',
    admin: 'Amministratore',
    artist: 'Artista',
    viewer: 'Visualizzatore',
  },

  // Permissions
  permissions: {
    manageTemplates: 'Gestisci Modelli',
    createForms: 'Crea Moduli',
    viewArchive: 'Visualizza Archivio',
    manageTeam: 'Gestisci Team',
    manageSettings: 'Gestisci Impostazioni',
  },

  // Errors
  errors: {
    generic: 'Si è verificato un errore. Riprova più tardi.',
    network: 'Errore di connessione. Controlla la tua connessione internet.',
    server: 'Errore del server. Riprova più tardi.',
    notFound: 'Pagina non trovata',
    forbidden: 'Non hai i permessi per accedere a questa risorsa',
    unauthorized: "Devi effettuare l'accesso per continuare",
    validation: 'Controlla i dati inseriti',
    fileUpload: 'Errore nel caricamento del file',
    fileTooLarge: 'Il file è troppo grande',
    invalidFileType: 'Tipo di file non valido',
    sessionExpired: "La tua sessione è scaduta. Effettua nuovamente l'accesso.",
    quotaExceeded: 'Quota di archiviazione superata',
    retryUpload: 'Riprova caricamento',
  },

  // Success messages
  success: {
    saved: 'Salvato con successo',
    deleted: 'Eliminato con successo',
    updated: 'Aggiornato con successo',
    created: 'Creato con successo',
    uploaded: 'Caricato con successo',
    sent: 'Inviato con successo',
  },

  // Confirmation dialogs
  confirmations: {
    unsavedChanges: 'Hai modifiche non salvate. Vuoi continuare?',
    deleteItem: 'Sei sicuro di voler eliminare questo elemento?',
    logout: 'Sei sicuro di voler uscire?',
    clearForm: 'Sei sicuro di voler cancellare il modulo?',
  },

  // Time and date
  time: {
    today: 'Oggi',
    yesterday: 'Ieri',
    thisWeek: 'Questa settimana',
    lastWeek: 'Settimana scorsa',
    thisMonth: 'Questo mese',
    lastMonth: 'Mese scorso',
    thisYear: "Quest'anno",
    lastYear: 'Anno scorso',
    custom: 'Personalizzato',
    format: {
      date: 'DD/MM/YYYY',
      time: 'HH:mm',
      datetime: 'DD/MM/YYYY HH:mm',
    },
  },

  // Legal/Consent specific
  consent: {
    title: 'Consenso Informato',
    readAndUnderstood: 'Ho letto e compreso le informazioni fornite',
    agreeToTerms: 'Accetto i termini e le condizioni',
    dataProcessing: 'Acconsento al trattamento dei miei dati personali',
    minorConsent: 'Consenso del genitore/tutore per minore',
    healthDeclaration: 'Dichiarazione sullo stato di salute',
    allergies: 'Allergie note',
    medications: 'Farmaci in uso',
    medicalConditions: 'Condizioni mediche',
    aftercareUnderstood: 'Ho compreso le istruzioni per la cura post-tatuaggio',
    riskAcknowledgment: 'Riconosco i rischi associati al tatuaggio',
    photographyConsent: 'Consenso per fotografie',
    gdprNotice: 'Informativa GDPR',
    retentionPeriod:
      'I dati saranno conservati per il periodo previsto dalla legge',
  },

  // GDPR
  gdpr: {
    privacyNotice: 'Informativa sulla Privacy',
    dataController: 'Titolare del Trattamento',
    dataSubject: 'Interessato',
    purpose: 'Finalità del Trattamento',
    legalBasis: 'Base Giuridica',
    retention: 'Periodo di Conservazione',
    rights: 'I tuoi Diritti',
    rightToAccess: 'Diritto di accesso',
    rightToRectification: 'Diritto di rettifica',
    rightToErasure: 'Diritto alla cancellazione',
    rightToPortability: 'Diritto alla portabilità',
    rightToObject: 'Diritto di opposizione',
    contactDPO: 'Contatta il DPO',
  },

  // Accessibility
  a11y: {
    skipToContent: 'Vai al contenuto',
    menu: 'Menu',
    closeMenu: 'Chiudi menu',
    openMenu: 'Apri menu',
    loading: 'Caricamento in corso',
    expandAll: 'Espandi tutto',
    collapseAll: 'Comprimi tutto',
    selectAll: 'Seleziona tutto',
    deselectAll: 'Deseleziona tutto',
    sortAscending: 'Ordine crescente',
    sortDescending: 'Ordine decrescente',
  },
}

// Type helper for accessing nested keys
export type ItalianContentKeys = keyof typeof italianContent
export type ItalianContentNestedKeys<T extends ItalianContentKeys> =
  keyof (typeof italianContent)[T]

// Helper function to get content with fallback
export function getContent<T extends ItalianContentKeys>(
  section: T,
  key: ItalianContentNestedKeys<T>,
  fallback?: string,
): string {
  try {
    const value =
      italianContent[section][key as keyof (typeof italianContent)[T]]
    return typeof value === 'string' ? value : fallback || ''
  } catch {
    return fallback || ''
  }
}

// Export default for easier imports
export default italianContent
