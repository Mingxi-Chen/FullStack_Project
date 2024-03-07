export default function SortButtons({setSortingCriterion}) {
    return (
      <>
        <button className="buttons" onClick={() => setSortingCriterion('newest')} >
          Newest
        </button>
        <button className="buttons" onClick={() => setSortingCriterion('active')}>
          Active
        </button>
        <button className="buttons" onClick={() => setSortingCriterion('unanswered')}>
          Unanswered
        </button>
      
      </>
    );
  }