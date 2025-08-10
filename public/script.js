document.addEventListener('DOMContentLoaded', () => {
    // DOM Elements
    const originalPreview = document.getElementById('originalPreview');
    const resultPreview = document.getElementById('resultPreview');
    const imageUpload = document.getElementById('imageUpload');
    const filterCards = document.querySelectorAll('.filter-card');
    const filterTabs = document.querySelectorAll('.filter-tab');
    const navItems = document.querySelectorAll('.nav-item');

    // Current state
    let currentImageFile = null;
    let selectedFilter = null;

    // Image upload functionality
    imageUpload.addEventListener('change', (event) => {
        const files = event.target.files;
        if (files && files.length > 0) {
            currentImageFile = files[0];
            const reader = new FileReader();
            reader.onload = (e) => {
                originalPreview.innerHTML = `
                    <img src="${e.target.result}" alt="Original image" class="w-full h-full object-cover rounded-xl">
                `;
            };
            reader.readAsDataURL(currentImageFile);

            // Reset result preview
            resultPreview.innerHTML = `
                <div class="text-center">
                    <i class="fas fa-spinner text-3xl text-gray-500 mb-3 processing-animation"></i>
                    <p class="text-gray-400 text-sm">Select a filter to see results</p>
                </div>
            `;
        }
    });

    // Filter selection functionality
    filterCards.forEach(card => {
        card.addEventListener('click', async function() {
            if (!currentImageFile) {
                alert('Please upload an image first!');
                return;
            }

            // Remove active class from all cards
            filterCards.forEach(c => c.classList.remove('active'));
            // Add active class to clicked card
            this.classList.add('active');

            // Get filter name
            const filterName = this.querySelector('h3').textContent;
            selectedFilter = filterName;

            // Show processing state
            resultPreview.innerHTML = `
                <div class="w-full h-full flex flex-col items-center justify-center">
                    <i class="fas fa-spinner fa-spin text-3xl text-purple-500 mb-3"></i>
                    <p class="text-gray-400 text-sm mb-2">Applying ${filterName}...</p>
                </div>
            `;

            const formData = new FormData();
            formData.append('image', currentImageFile);
            formData.append('prompt', filterName);

            try {
                const response = await fetch('http://localhost:3000/generate-image', {
                    method: 'POST',
                    body: formData,
                });

                if (!response.ok) {
                    throw new Error('Failed to generate image.');
                }

                const data = await response.json();
                const imageUrl = data.imageUrl;

                resultPreview.innerHTML = `
                    <div class="result-image w-full h-full rounded-lg overflow-hidden">
                        <img src="${imageUrl}" alt="Processed image" class="w-full h-full object-cover">
                        <div class="absolute bottom-2 right-2 bg-black/50 text-white px-2 py-1 rounded-full text-xs">
                            ${filterName}
                        </div>
                    </div>
                `;
            } catch (error) {
                console.error('Error:', error);
                resultPreview.innerHTML = `
                    <div class="text-center text-red-400">
                        <i class="fas fa-exclamation-circle text-3xl mb-3"></i>
                        <p>Error generating image. Please try again.</p>
                    </div>
                `;
                alert('Error generating image: ' + error.message);
            }
        });
    });

    // Filter tab switching
    filterTabs.forEach(tab => {
        tab.addEventListener('click', function() {
            filterTabs.forEach(t => t.classList.remove('tab-active'));
            this.classList.add('tab-active');
        });
    });

    // Navigation items
    navItems.forEach(item => {
        item.addEventListener('click', function() {
            navItems.forEach(i => i.classList.remove('active'));
            this.classList.add('active');
        });
    });
});
