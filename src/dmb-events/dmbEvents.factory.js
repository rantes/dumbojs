Window.prototype.dmbEventsService = {
    panelClose: {event: new Event('dmb-panel.close'), listener: 'dmb-panel.close'},
    panelOpen: {event: new Event('dmb-panel.open'), listener: 'dmb-panel.open'},
    panelClosed: {event: new Event('dmb-panel.closed'), listener: 'dmb-panel.closed'},
    panelOpened: {event: new Event('dmb-panel.opened'), listener: 'dmb-panel.opened'},
    resetValidation: {event: new Event('dmb-validation.reset'), listener: 'dmb-validation.reset'},
    validate: {event: new Event('dmb-validation.validate'), listener: 'dmb-validation.validate'}
};
