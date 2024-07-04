const pricestrongInitialValue = document.querySelector('.giamay').textContent.trim();

document.querySelectorAll('.inputloai').forEach(item => {
    item.addEventListener('click', function() {
        // Loại bỏ chọn các checkbox khác
        document.querySelectorAll('.inputloai').forEach(otherCheckbox => {
            if (otherCheckbox !== this) {
                otherCheckbox.checked = false;
            }
        });

        const price = parseFloat(this.getAttribute('data-price'));
        const index = this.getAttribute('data-index');
        const pricestrong = document.querySelector('.giamay');
        const priceElement = document.querySelector(`#price${index}`);
        const priceValue = priceElement.textContent.trim();

        if (this.checked) {
            pricestrong.textContent = priceValue;
        } else {
            // Khôi phục giá trị ban đầu của pricestrong
            pricestrong.textContent = pricestrongInitialValue;
        }
    });
});

document.addEventListener("DOMContentLoaded", function() {
    var content = document.getElementById("content");
    var paragraph = content.querySelector("p");
    var toggleButton = content.querySelector("#toggleButton");

    // Thu gọn nội dung ban đầu
    paragraph.classList.add("collapsed");

    toggleButton.addEventListener("click", function(e) {
        e.preventDefault();

        if (paragraph.classList.contains("collapsed")) {
            paragraph.classList.remove("collapsed");
            toggleButton.textContent = "Thu gọn"; // Chuyển nút sang "Thu gọn"
        } else {
            paragraph.classList.add("collapsed");
            toggleButton.textContent = "Xem thêm"; // Chuyển nút sang "Xem thêm"
        }
    });
});