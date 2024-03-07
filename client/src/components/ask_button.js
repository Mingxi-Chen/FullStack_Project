export default function Ask({id ,onAskClick}) {
    return (
        <>
            
                <button id={id} className='ask_button' onClick={onAskClick} >Ask Questions</button>
            
        </>
    );
  }
