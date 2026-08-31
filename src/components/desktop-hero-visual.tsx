import styles from "./scroll-hero.module.css";

export default function DesktopHeroVisual() {
  return (
    <div className={styles.browserWrap} aria-label="Example Launchset website project">
      <div className={styles.browserGlow} />
      <div className={styles.browser}>
        <div className={styles.browserBar}>
          <div><i /><i /><i /></div>
          <span>launchset.dev / latest</span>
          <b>＋</b>
        </div>
        <div className={styles.handoffSite}>
          <div className={styles.handoffContent}>
            <div className={styles.visualComposition} aria-hidden="true">
              <div className={styles.visualGrid} />
              <div className={styles.visualGlow} />
              <div className={styles.designMessage}>
                <span>01 / DIGITAL EXPERIENCES</span>
                <h2>Design focused.</h2>
              </div>
              <div className={styles.monolith}>
                <div className={styles.monolithWash} />
                <div className={styles.orbit}><i /><i /><i /></div>
                <div className={styles.sphere} />
                <div className={styles.monolithLines}><i /><i /><i /><i /><i /></div>
              </div>
              <div className={`${styles.glassPlane} ${styles.planeLeft}`}>
                <i /><i /><i />
              </div>
              <div className={`${styles.glassPlane} ${styles.planeRight}`}>
                <div /><div /><div /><div />
              </div>
              <div className={styles.floatingDisc}><i /></div>
              <div className={styles.edgeLines}><i /><i /><i /></div>
              <div className={styles.automationScreen}>
                <div className={styles.automationChrome}>
                  <div><i /><i /><i /></div>
                </div>
                <div className={styles.automationContent}>
                  <div className={styles.automationCopy}>
                    <span>02 / SMARTER SYSTEMS</span>
                    <h2>Useful automations.</h2>
                  </div>
                  <div className={styles.automationVisual}>
                    <div className={styles.workflowHeader}>
                      <span>ACTIVE</span>
                    </div>
                    <div className={styles.workflowCanvas}>
                      <svg className={`${styles.workflowConnections} ${styles.desktopConnections}`} viewBox="0 0 600 330" preserveAspectRatio="none" aria-hidden="true">
                        <path d="M145 165 H270" />
                        <path d="M295 165 C350 165 340 60 405 60" />
                        <path d="M295 165 H405" />
                        <path d="M295 165 C350 165 340 270 405 270" />
                        <path className={`${styles.flowBall} ${styles.flowBallMain}`} pathLength="100" d="M145 165 H270" />
                        <path className={`${styles.flowBall} ${styles.flowBallMain} ${styles.flowBallDelayed}`} pathLength="100" d="M145 165 H270" />
                        <path className={`${styles.flowBall} ${styles.flowBallTop}`} pathLength="100" d="M295 165 C350 165 340 60 405 60" />
                        <path className={`${styles.flowBall} ${styles.flowBallMiddle}`} pathLength="100" d="M295 165 H405" />
                        <path className={`${styles.flowBall} ${styles.flowBallBottom}`} pathLength="100" d="M295 165 C350 165 340 270 405 270" />
                      </svg>
                      <svg className={`${styles.workflowConnections} ${styles.mobileConnections}`} viewBox="0 0 330 500" preserveAspectRatio="none" aria-hidden="true">
                        <path d="M165 60 V155" />
                        <path d="M165 155 V245" />
                        <path d="M165 245 V340" />
                        <path d="M165 340 V435" />
                        <path className={`${styles.flowBall} ${styles.flowBallMain}`} pathLength="100" d="M165 60 V155" />
                        <path className={`${styles.flowBall} ${styles.flowBallTop}`} pathLength="100" d="M165 155 V245" />
                        <path className={`${styles.flowBall} ${styles.flowBallMiddle}`} pathLength="100" d="M165 245 V340" />
                        <path className={`${styles.flowBall} ${styles.flowBallBottom}`} pathLength="100" d="M165 340 V435" />
                      </svg>
                      <div className={`${styles.workflowNode} ${styles.triggerNode}`}>
                        <i>↗</i>
                        <div><b>TRIGGER</b><span>Website enquiry</span></div>
                      </div>
                      <div className={styles.routerNode}><i /><i /><i /></div>
                      <div className={`${styles.workflowNode} ${styles.actionOne}`}>
                        <i>＋</i><div><b>ACTION</b><span>Create customer</span></div>
                      </div>
                      <div className={`${styles.workflowNode} ${styles.actionTwo}`}>
                        <i>✦</i><div><b>ACTION</b><span>Send tailored reply</span></div>
                      </div>
                      <div className={`${styles.workflowNode} ${styles.actionThree}`}>
                        <i>✓</i><div><b>ACTION</b><span>Notify the team</span></div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
