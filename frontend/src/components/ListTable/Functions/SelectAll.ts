
const SelectAll = () => {
    const isAllSelected = data.length > 0 && selectedLeads.length === data.length;
    
      const toggleSelectAll = () => {
        if (isAllSelected) {
          setSelectedLeads([]);
        } else {
          setSelectedLeads(data.map((lead) => lead.id.toString()));
        }
      }
}
