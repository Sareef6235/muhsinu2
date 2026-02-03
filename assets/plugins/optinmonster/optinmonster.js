/**
 * OPTINMONSTER PLUGIN
 * Popup and lead capture system
 */

window.OptinMonster = {
    version: '1.0.0',

    init() {
        console.log('👻 OptinMonster initialized');
        // Trigger popup after 5 seconds for demo
        // setTimeout(() => this.showPopup('discount-offer'), 5000);
    },

    showPopup(id) {
        alert('🎉 Special Offer!\n\nGet 20% off your first booking!');
    }
};

export default window.OptinMonster;
