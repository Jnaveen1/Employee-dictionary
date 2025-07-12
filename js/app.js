document.addEventListener("DOMContentLoaded", () => {
  const container = document.getElementById("employee-list-container");
  const formContainer = document.getElementById("employee-form-container");
  const form = document.getElementById("employee-form");
  const addBtn = document.getElementById("add-employee-btn");
  const cancelBtn = document.getElementById("cancel-btn");
  const searchInput = document.getElementById("search-input");
  const sortSelect = document.getElementById("sort-by");
  const filterToggle = document.getElementById("filter-toggle");
  const filterSidebar = document.getElementById("filter-sidebar");
  const applyFilterBtn = document.getElementById("apply-filter");
  const resetFilterBtn = document.getElementById("reset-filter");
  const prevBtn = document.getElementById("prev-page");
  const nextBtn = document.getElementById("next-page");
  const pageIndicator = document.getElementById("page-indicator");

  // Fake Data (can be assigned via Freemarker)
  let employees = window.employees || []; // from js/data.js or Freemarker
  let filteredEmployees = [...employees];

  let currentPage = 1;
  let perPage = 10;

  function getPaginatedList(list, page) {
    const start = (page - 1) * perPage;
    return list.slice(start, start + perPage);
  }

  function updatePagination(list) {
    const totalPages = Math.ceil(list.length / perPage) || 1;
    pageIndicator.textContent = `Page ${currentPage} of ${totalPages}`;
    prevBtn.disabled = currentPage === 1;
    nextBtn.disabled = currentPage === totalPages;
  }

  function renderEmployees(list) {
    container.innerHTML = "";
    if (list.length === 0) {
      container.innerHTML = "<p>No employees found.</p>";
      return;
    }
    list.forEach(emp => {
      const card = document.createElement("div");
      card.className = "employee-card";
      card.innerHTML = `
        <h3>${emp.firstName} ${emp.lastName}</h3>
        <p><strong>Email:</strong> ${emp.email}</p>
        <p><strong>Department:</strong> ${emp.department}</p>
        <p><strong>Role:</strong> ${emp.role}</p>
        <button class="edit-btn" data-id="${emp.id}">✏️ Edit</button>
        <button class="delete-btn" data-id="${emp.id}">🗑️ Delete</button>
      `;
      container.appendChild(card);
    });
    attachListeners();
  }

  function renderPaginatedEmployees(list) {
    const paginated = getPaginatedList(list, currentPage);
    renderEmployees(paginated);
    updatePagination(list);
  }

  function attachListeners() {
    document.querySelectorAll(".delete-btn").forEach(btn =>
      btn.onclick = e => {
        const id = +e.target.dataset.id;
        if (!id) return alert("Invalid employee selected.");
        if (confirm("Are you sure you want to delete this employee?")) {
          const index = employees.findIndex(emp => emp.id === id);
          if (index !== -1) {
            employees.splice(index, 1);
            filteredEmployees = [...employees];
            renderPaginatedEmployees(filteredEmployees);
          }
        }
      }
    );

    document.querySelectorAll(".edit-btn").forEach(btn =>
      btn.onclick = e => {
        const id = +e.target.dataset.id;
        const emp = employees.find(emp => emp.id === id);
        if (!emp) return alert("Employee not found.");
        form.reset();
        document.getElementById("form-title").textContent = "Edit Employee";
        formContainer.style.display = "block";
        document.getElementById("employee-id").value = emp.id;
        document.getElementById("first-name").value = emp.firstName;
        document.getElementById("last-name").value = emp.lastName;
        document.getElementById("email").value = emp.email;
        document.getElementById("department").value = emp.department;
        document.getElementById("role").value = emp.role;
      }
    );
  }

  function validateForm() {
    const email = document.getElementById("email").value.trim();
    const requiredFields = ["first-name", "last-name", "email", "department", "role"];
    let valid = true;

    requiredFields.forEach(id => {
      const el = document.getElementById(id);
      if (!el.value.trim()) {
        el.style.border = "1px solid red";
        valid = false;
      } else {
        el.style.border = "";
      }
    });

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      alert("Invalid email format.");
      return false;
    }

    return valid;
  }

  form.onsubmit = e => {
    e.preventDefault();
    if (!validateForm()) return;

    const id = document.getElementById("employee-id").value;
    const newEmp = {
      id: id ? +id : Date.now(),
      firstName: document.getElementById("first-name").value.trim(),
      lastName: document.getElementById("last-name").value.trim(),
      email: document.getElementById("email").value.trim(),
      department: document.getElementById("department").value.trim(),
      role: document.getElementById("role").value.trim()
    };

    if (id) {
      const index = employees.findIndex(emp => emp.id === +id);
      if (index !== -1) employees[index] = newEmp;
    } else {
      employees.push(newEmp);
    }

    filteredEmployees = [...employees];
    currentPage = 1;
    renderPaginatedEmployees(filteredEmployees);
    formContainer.style.display = "none";
  };

  addBtn.onclick = () => {
    form.reset();
    document.getElementById("employee-id").value = "";
    document.getElementById("form-title").textContent = "Add Employee";
    formContainer.style.display = "block";
  };

  cancelBtn.onclick = () => formContainer.style.display = "none";

  searchInput.oninput = () => {
    const q = searchInput.value.trim().toLowerCase();
    filteredEmployees = employees.filter(emp =>
      emp.firstName.toLowerCase().includes(q) ||
      emp.lastName.toLowerCase().includes(q) ||
      emp.email.toLowerCase().includes(q)
    );
    currentPage = 1;
    renderPaginatedEmployees(filteredEmployees);
  };

  sortSelect.onchange = () => {
    const val = sortSelect.value;
    if (!val) return;
    const [key, dir] = val.split("-");
    filteredEmployees = [...filteredEmployees].sort((a, b) => {
      const A = a[key].toLowerCase(), B = b[key].toLowerCase();
      return A < B ? (dir === "asc" ? -1 : 1) : A > B ? (dir === "asc" ? 1 : -1) : 0;
    });
    currentPage = 1;
    renderPaginatedEmployees(filteredEmployees);
  };

  filterToggle.onclick = () => {
    filterSidebar.style.display = filterSidebar.style.display === "none" ? "block" : "none";
  };

  applyFilterBtn.onclick = () => {
    const fn = document.getElementById("filter-name").value.trim().toLowerCase();
    const dept = document.getElementById("filter-department").value.trim().toLowerCase();
    const role = document.getElementById("filter-role").value.trim().toLowerCase();
    filteredEmployees = employees.filter(emp =>
      (!fn || emp.firstName.toLowerCase().includes(fn)) &&
      (!dept || emp.department.toLowerCase().includes(dept)) &&
      (!role || emp.role.toLowerCase().includes(role))
    );
    currentPage = 1;
    renderPaginatedEmployees(filteredEmployees);
    filterSidebar.style.display = "none";
  };

  resetFilterBtn.onclick = () => {
    document.getElementById("filter-name").value = "";
    document.getElementById("filter-department").value = "";
    document.getElementById("filter-role").value = "";
    filteredEmployees = [...employees];
    currentPage = 1;
    renderPaginatedEmployees(filteredEmployees);
    filterSidebar.style.display = "none";
  };

  prevBtn.onclick = () => {
    if (currentPage > 1) {
      currentPage--;
      renderPaginatedEmployees(filteredEmployees);
    }
  };

  nextBtn.onclick = () => {
    const totalPages = Math.ceil(filteredEmployees.length / perPage);
    if (currentPage < totalPages) {
      currentPage++;
      renderPaginatedEmployees(filteredEmployees);
    }
  };

  renderPaginatedEmployees(filteredEmployees);
});
