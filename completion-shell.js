(()=>{
  const nativeShowReport=typeof showReport==='function'?showReport:null;
  if(!nativeShowReport)return;

  const removeJourneyBar=()=>document.getElementById('reportJourneyBar')?.remove();

  showReport=function(){
    removeJourneyBar();
    nativeShowReport();

    const report=document.getElementById('report');
    if(!report)return;

    const cityButton=report.querySelector('#cityBtn');
    if(!cityButton)return;

    // Keep the readiness plan itself as the learner artifact. The journey
    // navigation belongs outside the document in its own Level Up footer.
    report.querySelector('.completion-route')?.remove();

    const journeyBar=document.createElement('section');
    journeyBar.id='reportJourneyBar';
    journeyBar.className='report-journey-bar';
    journeyBar.setAttribute('aria-label','Level Up journey continuation');

    const message=document.createElement('div');
    message.className='journey-message';
    message.innerHTML='<strong>✓ Confidence Checkpoint Complete</strong><span>Interview Arena is now unlocked in Opportunity City.</span>';

    cityButton.classList.add('journey-primary');
    journeyBar.append(message,cityButton);
    document.body.appendChild(journeyBar);

    const returnButton=report.querySelector('#returnLesson');
    if(returnButton){
      const nativeReturn=returnButton.onclick;
      returnButton.onclick=(event)=>{
        removeJourneyBar();
        if(nativeReturn)nativeReturn.call(returnButton,event);
      };
    }
  };
})();
