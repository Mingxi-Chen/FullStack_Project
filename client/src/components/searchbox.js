
export default function Searchbox({setSearchInput ,setSortingCriterion,setActivePage}) {
  const handleKeyPress = (e) => {
    if (e.key === 'Enter') {
      setSearchInput(e.target.value);
      setSortingCriterion('search');
      setActivePage('Questions');
    }
  };
    return (
      <input type="text" id='search_box' placeholder="Search..." onKeyDown={handleKeyPress} />
    );
  }