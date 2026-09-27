const searchInput = document.getElementById("project-search-input");
const searchFeedback = document.getElementById("project-search-feedback");
const projectCards = Array.from(document.querySelectorAll("#project-results .release-card"));

if (searchInput && searchFeedback && projectCards.length) {
  const normalize = (value) => value.normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLocaleLowerCase("pt-BR");
  const searchableCards = projectCards.map((card) => ({
    card,
    text: normalize(`${card.dataset.search || ""} ${card.textContent}`),
  }));

  searchInput.addEventListener("input", () => {
    const terms = normalize(searchInput.value.trim()).split(/\s+/).filter(Boolean);
    let found = 0;

    for (const { card, text } of searchableCards) {
      const matches = terms.every((term) => text.includes(term));
      card.hidden = !matches;
      if (matches) found += 1;
    }

    searchFeedback.hidden = terms.length === 0;
    if (terms.length) {
      searchFeedback.textContent = found === 0
        ? "Nenhum projeto encontrado. Tente outro nome."
        : `${found} ${found === 1 ? "projeto encontrado" : "projetos encontrados"}.`;
    }
  });
}
