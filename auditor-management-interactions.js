// 🎭 AUDITOR MANAGEMENT ENHANCED INTERACTIONS
// Erweiterte Interaktivität für Auditor-Verwaltung und Auditplan-Generator

console.log('🎭 Loading Auditor Management Enhanced Interactions...');

// Erweitere QHSEDashboard mit Premium-Interaktionen
if (typeof QHSEDashboard !== 'undefined') {
    
    // ===== TAB SYSTEM ENHANCEMENTS =====
    QHSEDashboard.prototype.enhanceTabSystem = function() {
        console.log('🔄 Enhancing tab system with premium effects...');
        
        const tabs = document.querySelectorAll('.auditor-management-tabs .tab-btn');
        
        tabs.forEach(tab => {
            // Add premium hover effects
            tab.addEventListener('mouseenter', (e) => {
                this.createTabHoverEffect(e.target);
            });
            
            // Add click enhancement
            tab.addEventListener('click', (e) => {
                this.createTabClickEffect(e.target);
                this.animateTabContent(e.target.dataset.tab);
            });
        });
    };
    
    // ===== TAB VISUAL EFFECTS =====
    QHSEDashboard.prototype.createTabHoverEffect = function(tab) {
        // Create ripple effect on hover
        const ripple = document.createElement('div');
        ripple.style.cssText = `
            position: absolute;
            top: 50%;
            left: 50%;
            width: 0;
            height: 0;
            background: radial-gradient(circle, rgba(102, 126, 234, 0.3) 0%, transparent 70%);
            border-radius: 50%;
            transform: translate(-50%, -50%);
            animation: tabHoverRipple 0.6s ease-out;
            pointer-events: none;
            z-index: 1;
        `;
        
        tab.appendChild(ripple);
        
        setTimeout(() => {
            if (ripple.parentNode) {
                ripple.parentNode.removeChild(ripple);
            }
        }, 600);
    };
    
    QHSEDashboard.prototype.createTabClickEffect = function(tab) {
        // Create celebration effect on tab click
        const celebration = document.createElement('div');
        celebration.style.cssText = `
            position: absolute;
            top: -10px;
            left: 50%;
            transform: translateX(-50%);
            font-size: 20px;
            color: #667eea;
            animation: tabCelebration 0.8s ease-out;
            pointer-events: none;
            z-index: 10;
        `;
        celebration.textContent = '✨';
        
        tab.appendChild(celebration);
        
        setTimeout(() => {
            if (celebration.parentNode) {
                celebration.parentNode.removeChild(celebration);
            }
        }, 800);
    };
    
    // ===== CONTENT ANIMATION =====
    QHSEDashboard.prototype.animateTabContent = function(tabId) {
        const content = document.getElementById(tabId + '-tab');
        if (content) {
            content.style.opacity = '0';
            content.style.transform = 'translateY(20px)';
            
            setTimeout(() => {
                content.style.transition = 'all 0.5s cubic-bezier(0.175, 0.885, 0.32, 1.275)';
                content.style.opacity = '1';
                content.style.transform = 'translateY(0)';
            }, 100);
        }
    };
    
    // ===== STAT CARD ENHANCEMENTS =====
    QHSEDashboard.prototype.enhanceStatCards = function() {
        console.log('📊 Enhancing stat cards...');
        
        const statCards = document.querySelectorAll('.auditor-stats .stat-card');
        
        statCards.forEach((card, index) => {
            // Add staggered entrance animation
            card.style.animationDelay = `${index * 0.1}s`;
            card.classList.add('stat-card-entrance');
            
            // Add click interaction
            card.addEventListener('click', () => {
                this.createStatCardPulse(card);
                this.showStatCardDetails(card, index);
            });
            
            // Add number counting animation
            const number = card.querySelector('.stat-number');
            if (number) {
                this.animateNumber(number, parseInt(number.textContent) || 0);
            }
        });
    };
    
    QHSEDashboard.prototype.createStatCardPulse = function(card) {
        card.style.animation = 'statCardPulse 0.6s ease-out';
        
        setTimeout(() => {
            card.style.animation = '';
        }, 600);
    };
    
    QHSEDashboard.prototype.animateNumber = function(element, targetNumber) {
        let current = 0;
        const increment = targetNumber / 30; // Animation over 30 frames
        const duration = 1500; // 1.5 seconds
        const stepTime = duration / 30;
        
        const timer = setInterval(() => {
            current += increment;
            if (current >= targetNumber) {
                current = targetNumber;
                clearInterval(timer);
                // Add completion effect
                element.style.animation = 'numberComplete 0.5s ease-out';
            }
            element.textContent = Math.floor(current);
        }, stepTime);
    };
    
    QHSEDashboard.prototype.showStatCardDetails = function(card, index) {
        const details = [
            'Alle registrierten Auditoren im System',
            'Auditoren die für Audits verfügbar sind',
            'Auditoren mit gültigen Zertifizierungen'
        ];
        
        this.showTooltip(card, details[index] || 'Statistik-Details');
    };
    
    // ===== FORM ENHANCEMENTS =====
    QHSEDashboard.prototype.enhanceFormElements = function() {
        console.log('📝 Enhancing form elements...');
        
        // Enhance all form inputs
        const inputs = document.querySelectorAll('.form-group input, .form-group select, .form-group textarea');
        inputs.forEach(input => {
            this.addInputEnhancements(input);
        });
        
        // Enhance checkboxes
        const checkboxes = document.querySelectorAll('.checkbox-label');
        checkboxes.forEach(checkbox => {
            this.addCheckboxEnhancements(checkbox);
        });
        
        // Enhance buttons
        const buttons = document.querySelectorAll('.btn');
        buttons.forEach(button => {
            this.addButtonEnhancements(button);
        });
    };
    
    QHSEDashboard.prototype.addInputEnhancements = function(input) {
        // Add floating label effect
        const label = input.parentNode.querySelector('label');
        if (label) {
            input.addEventListener('focus', () => {
                label.style.transform = 'translateY(-20px) scale(0.9)';
                label.style.color = '#667eea';
                label.style.transition = 'all 0.3s ease';
            });
            
            input.addEventListener('blur', () => {
                if (!input.value) {
                    label.style.transform = 'translateY(0) scale(1)';
                    label.style.color = '#374151';
                }
            });
        }
        
        // Add validation feedback
        input.addEventListener('input', () => {
            this.validateInput(input);
        });
        
        // Add success animation on valid input
        input.addEventListener('change', () => {
            if (input.checkValidity()) {
                this.showInputSuccess(input);
            }
        });
    };
    
    QHSEDashboard.prototype.validateInput = function(input) {
        const isValid = input.checkValidity();
        
        if (isValid) {
            input.style.borderColor = '#22c55e';
            input.style.boxShadow = '0 0 0 3px rgba(34, 197, 94, 0.1)';
        } else if (input.value && !isValid) {
            input.style.borderColor = '#ef4444';
            input.style.boxShadow = '0 0 0 3px rgba(239, 68, 68, 0.1)';
        } else {
            input.style.borderColor = 'rgba(226, 232, 240, 0.8)';
            input.style.boxShadow = 'inset 0 2px 8px rgba(0, 0, 0, 0.05)';
        }
    };
    
    QHSEDashboard.prototype.showInputSuccess = function(input) {
        const checkmark = document.createElement('div');
        checkmark.style.cssText = `
            position: absolute;
            right: 12px;
            top: 50%;
            transform: translateY(-50%);
            color: #22c55e;
            font-size: 16px;
            animation: inputCheckmark 0.5s ease-out;
            z-index: 10;
        `;
        checkmark.innerHTML = '✓';
        
        input.parentNode.style.position = 'relative';
        input.parentNode.appendChild(checkmark);
        
        setTimeout(() => {
            if (checkmark.parentNode) {
                checkmark.parentNode.removeChild(checkmark);
            }
        }, 2000);
    };
    
    QHSEDashboard.prototype.addCheckboxEnhancements = function(checkbox) {
        const input = checkbox.querySelector('input[type="checkbox"]');
        const checkmark = checkbox.querySelector('.checkmark');
        
        checkbox.addEventListener('click', () => {
            if (input.checked) {
                this.createCheckboxCelebration(checkmark);
            }
        });
    };
    
    QHSEDashboard.prototype.createCheckboxCelebration = function(checkmark) {
        // Create small celebration effect
        const particles = [];
        for (let i = 0; i < 5; i++) {
            const particle = document.createElement('div');
            particle.style.cssText = `
                position: absolute;
                width: 4px;
                height: 4px;
                background: #667eea;
                border-radius: 50%;
                pointer-events: none;
                animation: checkboxParticle 0.8s ease-out forwards;
                animation-delay: ${i * 0.1}s;
            `;
            
            particle.style.left = Math.random() * 20 - 10 + 'px';
            particle.style.top = Math.random() * 20 - 10 + 'px';
            
            checkmark.appendChild(particle);
            particles.push(particle);
        }
        
        setTimeout(() => {
            particles.forEach(particle => {
                if (particle.parentNode) {
                    particle.parentNode.removeChild(particle);
                }
            });
        }, 1000);
    };
    
    QHSEDashboard.prototype.addButtonEnhancements = function(button) {
        button.addEventListener('click', (e) => {
            this.createButtonRipple(e, button);
        });
        
        // Add loading state capability
        const originalText = button.innerHTML;
        button.setAttribute('data-original-text', originalText);
    };
    
    QHSEDashboard.prototype.createButtonRipple = function(event, button) {
        const rect = button.getBoundingClientRect();
        const size = Math.max(rect.width, rect.height);
        const x = event.clientX - rect.left - size / 2;
        const y = event.clientY - rect.top - size / 2;
        
        const ripple = document.createElement('div');
        ripple.style.cssText = `
            position: absolute;
            width: ${size}px;
            height: ${size}px;
            left: ${x}px;
            top: ${y}px;
            background: rgba(255, 255, 255, 0.6);
            border-radius: 50%;
            transform: scale(0);
            animation: buttonRippleEffect 0.6s ease-out;
            pointer-events: none;
        `;
        
        button.appendChild(ripple);
        
        setTimeout(() => {
            if (ripple.parentNode) {
                ripple.parentNode.removeChild(ripple);
            }
        }, 600);
    };
    
    // ===== TOOLTIP SYSTEM =====
    QHSEDashboard.prototype.showTooltip = function(element, text) {
        const tooltip = document.createElement('div');
        tooltip.className = 'premium-tooltip';
        tooltip.style.cssText = `
            position: fixed;
            background: linear-gradient(135deg, #1f2937 0%, #374151 100%);
            color: white;
            padding: 12px 16px;
            border-radius: 8px;
            font-size: 14px;
            font-weight: 500;
            box-shadow: 0 10px 40px rgba(0, 0, 0, 0.3);
            z-index: 10000;
            pointer-events: none;
            animation: tooltipFadeIn 0.3s ease-out;
            max-width: 250px;
            line-height: 1.4;
        `;
        tooltip.textContent = text;
        
        document.body.appendChild(tooltip);
        
        // Position tooltip
        const rect = element.getBoundingClientRect();
        const tooltipRect = tooltip.getBoundingClientRect();
        
        let left = rect.left + rect.width / 2 - tooltipRect.width / 2;
        let top = rect.top - tooltipRect.height - 10;
        
        // Adjust if tooltip goes off screen
        if (left < 10) left = 10;
        if (left + tooltipRect.width > window.innerWidth - 10) {
            left = window.innerWidth - tooltipRect.width - 10;
        }
        if (top < 10) {
            top = rect.bottom + 10;
        }
        
        tooltip.style.left = left + 'px';
        tooltip.style.top = top + 'px';
        
        setTimeout(() => {
            if (tooltip.parentNode) {
                tooltip.style.animation = 'tooltipFadeOut 0.3s ease-out forwards';
                setTimeout(() => {
                    if (tooltip.parentNode) {
                        tooltip.parentNode.removeChild(tooltip);
                    }
                }, 300);
            }
        }, 3000);
    };
    
    // ===== AUDIT PLAN GENERATOR ENHANCEMENTS =====
    QHSEDashboard.prototype.enhanceAuditPlanGenerator = function() {
        console.log('📋 Enhancing audit plan generator...');
        
        // Enhance ZN input
        const znInput = document.getElementById('znNumberInput');
        if (znInput) {
            znInput.addEventListener('keypress', (e) => {
                if (e.key === 'Enter') {
                    this.addZNWithAnimation();
                }
            });
        }
        
        // Enhance logo upload
        const logoUpload = document.querySelector('.logo-upload-area');
        if (logoUpload) {
            this.enhanceLogoUpload(logoUpload);
        }
        
        // Add section animations (disabled icon rotation)
        const configSections = document.querySelectorAll('.config-section');
        configSections.forEach((section, index) => {
            section.style.animationDelay = `${index * 0.1}s`;
            section.classList.add('config-section-entrance');
        });
    };
    
    QHSEDashboard.prototype.addZNWithAnimation = function() {
        // Add visual feedback when adding ZN numbers
        const znInput = document.getElementById('znNumberInput');
        if (znInput && znInput.value.trim()) {
            this.showInputSuccess(znInput);
            
            // Call original function if it exists
            if (typeof addZNNumber === 'function') {
                addZNNumber();
            }
            
            // Add celebration effect
            this.createMiniCelebration(znInput);
        }
    };
    
    QHSEDashboard.prototype.createMiniCelebration = function(element) {
        const celebration = document.createElement('div');
        celebration.style.cssText = `
            position: absolute;
            top: -20px;
            left: 50%;
            transform: translateX(-50%);
            font-size: 16px;
            animation: miniCelebrationFloat 1s ease-out;
            pointer-events: none;
            z-index: 10;
        `;
        celebration.textContent = '🎉';
        
        element.parentNode.style.position = 'relative';
        element.parentNode.appendChild(celebration);
        
        setTimeout(() => {
            if (celebration.parentNode) {
                celebration.parentNode.removeChild(celebration);
            }
        }, 1000);
    };
    
    QHSEDashboard.prototype.enhanceLogoUpload = function(logoUpload) {
        logoUpload.addEventListener('dragover', (e) => {
            e.preventDefault();
            logoUpload.style.borderColor = 'rgba(255,255,255,0.8)';
            logoUpload.style.background = 'rgba(255,255,255,0.3)';
            logoUpload.style.transform = 'scale(1.05)';
        });
        
        logoUpload.addEventListener('dragleave', () => {
            logoUpload.style.borderColor = 'rgba(255,255,255,0.4)';
            logoUpload.style.background = 'rgba(255,255,255,0.1)';
            logoUpload.style.transform = 'scale(1)';
        });
        
        logoUpload.addEventListener('drop', (e) => {
            e.preventDefault();
            logoUpload.style.borderColor = 'rgba(255,255,255,0.4)';
            logoUpload.style.background = 'rgba(255,255,255,0.1)';
            logoUpload.style.transform = 'scale(1)';
            
            // Add success animation
            logoUpload.style.animation = 'logoUploadSuccess 0.6s ease-out';
            setTimeout(() => {
                logoUpload.style.animation = '';
            }, 600);
        });
    };
    
    // ===== INITIALIZATION =====
    const originalShowSection = QHSEDashboard.prototype.showSection;
    QHSEDashboard.prototype.showSection = function(sectionId) {
        const result = originalShowSection.call(this, sectionId);
        
        // Apply enhancements when auditor management section is shown
        if (sectionId === 'auditor-verwaltung') {
            setTimeout(() => {
                this.enhanceTabSystem();
                this.enhanceStatCards();
                this.enhanceFormElements();
                this.enhanceAuditPlanGenerator();
                
                console.log('✨ Auditor Management enhancements applied!');
            }, 200);
        }
        
        return result;
    };
    
    console.log('🎭 Auditor Management Enhanced Interactions loaded successfully!');
} else {
    console.warn('⚠️ QHSEDashboard not found - auditor management enhancements cannot be initialized');
}

// ===== PREMIUM CSS ANIMATIONS (Injected) =====
const premiumAnimations = `
<style>
@keyframes tabHoverRipple {
    to {
        width: 100px;
        height: 100px;
        opacity: 0;
    }
}

@keyframes tabCelebration {
    0% {
        opacity: 1;
        transform: translateX(-50%) translateY(0) scale(1);
    }
    100% {
        opacity: 0;
        transform: translateX(-50%) translateY(-30px) scale(1.5);
    }
}

@keyframes statCardPulse {
    0%, 100% { transform: scale(1); }
    50% { transform: scale(1.05); }
}

@keyframes numberComplete {
    0% { transform: scale(1); }
    50% { transform: scale(1.1); color: #667eea; }
    100% { transform: scale(1); }
}

@keyframes inputCheckmark {
    0% {
        opacity: 0;
        transform: translateY(-50%) scale(0);
    }
    50% {
        opacity: 1;
        transform: translateY(-50%) scale(1.2);
    }
    100% {
        opacity: 1;
        transform: translateY(-50%) scale(1);
    }
}

@keyframes checkboxParticle {
    0% {
        opacity: 1;
        transform: scale(1);
    }
    100% {
        opacity: 0;
        transform: scale(0) translateY(-20px);
    }
}

@keyframes buttonRippleEffect {
    to {
        transform: scale(2);
        opacity: 0;
    }
}

@keyframes tooltipFadeIn {
    from {
        opacity: 0;
        transform: translateY(10px) scale(0.9);
    }
    to {
        opacity: 1;
        transform: translateY(0) scale(1);
    }
}

@keyframes tooltipFadeOut {
    from {
        opacity: 1;
        transform: translateY(0) scale(1);
    }
    to {
        opacity: 0;
        transform: translateY(-10px) scale(0.9);
    }
}

@keyframes miniCelebrationFloat {
    0% {
        opacity: 1;
        transform: translateX(-50%) translateY(0) scale(1);
    }
    100% {
        opacity: 0;
        transform: translateX(-50%) translateY(-40px) scale(1.5);
    }
}

@keyframes logoUploadSuccess {
    0%, 100% { transform: scale(1); }
    50% { transform: scale(1.1); background: rgba(34, 197, 94, 0.2); }
}

.stat-card-entrance {
    animation: statCardEntrance 0.6s ease-out both;
}

@keyframes statCardEntrance {
    from {
        opacity: 0;
        transform: translateY(30px) scale(0.9);
    }
    to {
        opacity: 1;
        transform: translateY(0) scale(1);
    }
}

.config-section-entrance {
    animation: configSectionEntrance 0.6s ease-out both;
}

@keyframes configSectionEntrance {
    from {
        opacity: 0;
        transform: translateX(-30px);
    }
    to {
        opacity: 1;
        transform: translateX(0);
    }
}
</style>
`;

document.head.insertAdjacentHTML('beforeend', premiumAnimations);

// ===== AUTO-INITIALIZATION =====
document.addEventListener('DOMContentLoaded', function() {
    console.log('🎬 Initializing Auditor Management enhancements...');
    
    setTimeout(() => {
        if (window.qhseDashboard) {
            console.log('🎭 Auditor Management Enhanced Interactions ready!');
        }
    }, 1000);
});