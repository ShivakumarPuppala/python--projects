let pages = [];

let currentPage = 0;


async function loadPages() {

    const response = await fetch("/api/pages");

    pages = await response.json();

    displayPages();

}


function displayPages() {

    document.querySelector(".book").classList.add("turning");
    const leftPage = pages[currentPage];

    const rightPage = pages[currentPage + 1];


    displayPage("leftPage", leftPage);

    displayPage("rightPage", rightPage);
    document.getElementById("pageCounter").textContent =
    `Pages ${currentPage + 1}-${Math.min(currentPage + 2, pages.length)} of ${pages.length}`;


    document.querySelector(".page:nth-child(1) .page-number").textContent =
        `Page ${currentPage + 1}`;


    document.querySelector(".page:nth-child(2) .page-number").textContent =
        `Page ${currentPage + 2}`;
setTimeout(function() {
    document.querySelector(".book").classList.remove("turning");
}, 400);
}
document.addEventListener("click", async function(event) {

    if (!event.target.classList.contains("page-delete-button")) {
        return;
    }


    const pageId = event.target.dataset.pageId;

    if (!pageId || pageId === "null") {
        return;
    }


    const confirmed = confirm(
        "Are you sure you want to delete this diary page?"
    );

    if (!confirmed) {
        return;
    }


    const response = await fetch(`/api/pages/${pageId}`, {
        method: "DELETE"
    });


    if (response.ok) {

        alert("Page deleted successfully! 🗑️");

        await loadPages();

    }

});


function displayPage(elementId, page) {

    const element = document.getElementById(elementId);


    if (!page) {

        element.innerHTML = `
            <div class="diary-title">
                Empty Page
            </div>

            <div class="diary-content">
                Start writing your next memory...
            </div>
        `;

        return;

    }


  element.innerHTML = `

    <div class="diary-title" contenteditable="true">
        ${page.title}
    </div>

    <div class="diary-content" contenteditable="true">
        ${page.content}
    </div>

   <div class="page-footer">

    <div class="diary-date">
        ${page.created_at}
    </div>

    <button class="page-delete-button" data-page-id="${page.id}">
        🗑️ Delete Page
    </button>

</div>

`;

}


document.getElementById("nextButton").addEventListener("click", function() {

    if (currentPage + 2 < pages.length) {

        currentPage += 2;

        displayPages();

    }

});


document.getElementById("previousButton").addEventListener("click", function() {

    if (currentPage >= 2) {

        currentPage -= 2;

        displayPages();

    }

});

document.getElementById("newPageButton").addEventListener("click", async function() {

    const response = await fetch("/api/pages", {
        method: "POST",

        headers: {
            "Content-Type": "application/json"
        },

        body: JSON.stringify({
            title: "New Page",
            content: ""
        })
    });


    if (response.ok) {

        await loadPages();

    }

});
document.getElementById("saveButton").addEventListener("click", async function() {

    const leftPage = pages[currentPage];
    const rightPage = pages[currentPage + 1];


    async function savePage(page, elementId) {

        if (!page) {
            return;
        }


        const title =
            document.querySelector(`#${elementId} .diary-title`)?.textContent.trim() || "";

        const content =
            document.querySelector(`#${elementId} .diary-content`)?.textContent.trim() || "";


        // Don't save a completely empty page
        if (!title && !content) {
            return;
        }


        // New page
        if (!page.id) {

            const response = await fetch("/api/pages", {

                method: "POST",

                headers: {
                    "Content-Type": "application/json"
                },

                body: JSON.stringify({
                    title: title || "Untitled",
                    content: content
                })

            });


            if (response.ok) {

                const newPage = await response.json();

                page.id = newPage.id;

            }

        }


        // Existing page
        else {

            await fetch(`/api/pages/${page.id}`, {

                method: "PUT",

                headers: {
                    "Content-Type": "application/json"
                },

                body: JSON.stringify({
                    title: title,
                    content: content
                })

            });

        }

    }


    await savePage(leftPage, "leftPage");

    await savePage(rightPage, "rightPage");


    await loadPages();

    alert("Diary saved! 💾");

}); 
document.getElementById("searchButton").addEventListener("click", async function() {

    const searchText =
        document.getElementById("searchInput").value.trim();

    if (!searchText) {
        await loadPages();
        return;
    }

    const response = await fetch(
        `/api/search?q=${encodeURIComponent(searchText)}`
    );

    const results = await response.json();

    pages = results;
    currentPage = 0;

    displayPages();

});
document.getElementById("clearSearchButton").addEventListener("click", async function() {

    document.getElementById("searchInput").value = "";

    await loadPages();

    currentPage = 0;

    displayPages();

});
loadPages();
window.addEventListener("beforeunload", function(event) {

    const leftPage = pages[currentPage];
    const rightPage = pages[currentPage + 1];

    const leftContent =
        document.querySelector("#leftPage .diary-content")?.textContent.trim() || "";

    const rightContent =
        document.querySelector("#rightPage .diary-content")?.textContent.trim() || "";


    if (
        (leftPage && leftPage.id && leftContent) ||
        (rightPage && rightPage.id && rightContent)
    ) {

        event.preventDefault();

        event.returnValue = "";

    }

});
document.getElementById("logoutButton").addEventListener("click", function() {

    window.location.href = "/logout";

});
const calendarButton = document.getElementById("calendarButton");
const calendarModal = document.getElementById("calendarModal");
const closeCalendarButton = document.getElementById("closeCalendarButton");

let calendarDate = new Date();
let calendarPages = [];

async function loadCalendarPages() {

    const response = await fetch("/api/calendar");

    if (!response.ok) {
        console.error("Failed to load calendar pages");
        return;
    }

    calendarPages = await response.json();
}

calendarButton.addEventListener("click", async function () {

    calendarModal.style.display = "flex";

    await loadCalendarPages();

    renderCalendar();
});

closeCalendarButton.addEventListener("click", function () {
    calendarModal.style.display = "none";
});
document.getElementById("previousMonth").addEventListener("click", function () {

    calendarDate.setMonth(calendarDate.getMonth() - 1);

    renderCalendar();

});


document.getElementById("nextMonth").addEventListener("click", function () {

    calendarDate.setMonth(calendarDate.getMonth() + 1);

    renderCalendar();

});

function renderCalendar() {

    const calendar = document.getElementById("calendar");
    const calendarMonth = document.getElementById("calendarMonth");

    calendar.innerHTML = "";

    const year = calendarDate.getFullYear();
    const month = calendarDate.getMonth();

    const monthName = calendarDate.toLocaleString("default", {
        month: "long"
    });

    calendarMonth.textContent = `${monthName} ${year}`;

    // Weekday names
    const weekdays = [
        "Sun",
        "Mon",
        "Tue",
        "Wed",
        "Thu",
        "Fri",
        "Sat"
    ];

    weekdays.forEach(function(day) {

        const weekday = document.createElement("div");

        weekday.className = "calendar-weekday";
        weekday.textContent = day;

        calendar.appendChild(weekday);
    });

    // First weekday of the month
    const firstDay = new Date(year, month, 1).getDay();

    // Number of days in the month
    const daysInMonth = new Date(
        year,
        month + 1,
        0
    ).getDate();

    // Empty spaces before day 1
    for (let i = 0; i < firstDay; i++) {

        const emptyDay = document.createElement("div");

        emptyDay.className = "calendar-day empty";

        calendar.appendChild(emptyDay);
    }

    // Actual dates
    for (let day = 1; day <= daysInMonth; day++) {

        const dayElement = document.createElement("div");

        dayElement.className = "calendar-day";

        dayElement.textContent = day;

const monthNumber = String(month + 1).padStart(2, "0");
const dayNumber = String(day).padStart(2, "0");

const dateKey = `${year}-${monthNumber}-${dayNumber}`;

const hasEntry = calendarPages.some(function(page) {

    return page.created_at.startsWith(dateKey);

});

if (hasEntry) {

    dayElement.classList.add("has-entry");

    dayElement.addEventListener("click", function () {

        const page = calendarPages.find(function(page) {

            return page.created_at.startsWith(dateKey);

        });

        if (!page) {
            return;
        }

        const pageIndex = pages.findIndex(function(p) {

            return p.id === page.id;

        });

        if (pageIndex === -1) {
            return;
        }

        currentPage = pageIndex;

        displayPages();

        calendarModal.style.display = "none";

    });
}

calendar.appendChild(dayElement);
    }
}