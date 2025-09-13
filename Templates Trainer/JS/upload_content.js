document.addEventListener('DOMContentLoaded', function() {
    // Test API connectivity on page load
    console.log("Testing API connectivity...");
    fetch('/api/health', { 
        method: 'GET',
        credentials: 'include'
    })
    .then(response => {
        if (response.ok) {
            console.log("API connection successful");
        } else {
            console.warn("API connection test failed:", response.status);
        }
    })
    .catch(error => {
        console.error("API connection error:", error);
    });

    // Tab Switching for Content Types
    const tabBtns = document.querySelectorAll('.tab-btn');
    const tabContents = document.querySelectorAll('.tab-content');

    tabBtns.forEach(btn => {
        btn.addEventListener('click', () => {
            const tabId = btn.dataset.tab;
            
            tabBtns.forEach(b => b.classList.remove('active'));
            tabContents.forEach(c => c.classList.remove('active'));
            
            btn.classList.add('active');
            document.getElementById(tabId).classList.add('active');
        });
    });

    // Upload Tab Switching (File vs YouTube)
    const uploadTabBtns = document.querySelectorAll('.upload-tab-btn');
    const uploadTabContents = document.querySelectorAll('.upload-tab-content');

    uploadTabBtns.forEach(btn => {
        btn.addEventListener('click', () => {
            const tabId = btn.dataset.tab;
            
            uploadTabBtns.forEach(b => b.classList.remove('active'));
            uploadTabContents.forEach(c => c.classList.remove('active'));
            
            btn.classList.add('active');
            document.getElementById(tabId).classList.add('active');
        });
    });

    // YouTube URL Preview
    const youtubeUrlInput = document.getElementById('youtube-url');
    if (youtubeUrlInput) {
        youtubeUrlInput.addEventListener('input', debounce(function() {
            const url = youtubeUrlInput.value.trim();
            const youtubePreview = document.querySelector('.youtube-preview');
            const embedContainer = document.getElementById('youtube-embed-container');
            
            if (url.length > 10 && (url.includes('youtube.com/') || url.includes('youtu.be/'))) {
                // Extract video ID
                const videoId = extractYoutubeId(url);
                if (videoId) {
                    // Create embed
                    embedContainer.innerHTML = `
                        <iframe 
                            width="560" 
                            height="315" 
                            src="https://www.youtube.com/embed/${videoId}" 
                            title="YouTube video player" 
                            frameborder="0" 
                            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" 
                            allowfullscreen>
                        </iframe>
                    `;
                    youtubePreview.style.display = 'block';
                }
            } else {
                embedContainer.innerHTML = '';
                youtubePreview.style.display = 'none';
            }
        }, 500));
    }

    // Helper function to extract YouTube video ID
    function extractYoutubeId(url) {
        const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|\&v=)([^#\&\?]*).*/;
        const match = url.match(regExp);
        return (match && match[2].length === 11) ? match[2] : null;
    }

    // Debounce function to prevent too many rapid calls
    function debounce(func, wait) {
        let timeout;
        return function() {
            const context = this, args = arguments;
            clearTimeout(timeout);
            timeout = setTimeout(() => {
                func.apply(context, args);
            }, wait);
        };
    }

    // Video Upload Preview
    const videoInput = document.getElementById('video-upload');
    const videoPreview = document.getElementById('video-preview');
    const uploadLabel = document.querySelector('.file-upload label span');

    if (videoInput) {
        videoInput.addEventListener('change', function(e) {
            const file = e.target.files[0];
            if (file) {
                const url = URL.createObjectURL(file);
                videoPreview.src = url;
                videoPreview.style.display = 'block';
                uploadLabel.textContent = file.name;
            }
        });
    }

    // Publish Blog Button Handler
    const publishBlogBtn = document.querySelector('.publish-btn');
    if (publishBlogBtn) {
        console.log("Found publish blog button, adding click listener");
        publishBlogBtn.addEventListener('click', function() {
            console.log("Publish blog button clicked!");
            
            // Get form values
            const titleInput = document.querySelector('#blogs .form-group:nth-child(1) input');
            const categorySelect = document.querySelector('#blogs .form-group:nth-child(2) select');
            const blogImageInput = document.getElementById('blog-image');
            
            // For CKEditor, we need to get content differently
            let editorContent = '';
            if (window.editor) {
                // If we have direct access to the editor instance
                editorContent = window.editor.getData();
            } else {
                // Fallback to getting HTML from the editable div
                const editorElement = document.querySelector('.ck-editor__editable');
                editorContent = editorElement ? editorElement.innerHTML : '';
            }
            
            // Validate form
            if (!titleInput.value) {
                alert('Please enter a blog title');
                return;
            }
            
            if (categorySelect.selectedIndex === 0) {
                alert('Please select a category');
                return;
            }
            
            if (!blogImageInput.files || blogImageInput.files.length === 0) {
                alert('Please select a featured image');
                return;
            }
            
            if (!editorContent || editorContent.trim() === '') {
                alert('Please enter some content for your blog');
                return;
            }
            
            // Create FormData object to send to server
            const formData = new FormData();
            formData.append('title', titleInput.value);
            formData.append('category', categorySelect.value);
            formData.append('content', editorContent);
            
            // For the featured image, we need to first upload it and get the URL
            const fileReader = new FileReader();
            fileReader.readAsDataURL(blogImageInput.files[0]);
            fileReader.onload = function() {
                // Convert image to base64 string
                const base64Image = fileReader.result;
                formData.append('featuredImage', base64Image);
                
                // Show loading state
                publishBlogBtn.disabled = true;
                publishBlogBtn.textContent = 'Publishing...';
                
                // Send to server
                fetch('/api/blogs', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    credentials: 'include', // Include session cookies
                    body: JSON.stringify({
                        title: titleInput.value,
                        category: categorySelect.value,
                        content: editorContent,
                        featuredImage: base64Image
                    }),
                })
                .then(response => {
                    if (!response.ok) {
                        // Try to get more details about the error
                        return response.json().then(errorData => {
                            console.error('Server error details:', errorData);
                            throw new Error(`Failed to publish blog: ${errorData.message || 'Unknown error'}`);
                        }).catch(jsonError => {
                            console.error('Error parsing error response:', jsonError);
                            throw new Error(`Failed to publish blog: Status ${response.status}`);
                        });
                    }
                    return response.json();
                })
                .then(data => {
                    alert('Blog published successfully!');
                    // Reset form
                    titleInput.value = '';
                    categorySelect.selectedIndex = 0;
                    blogImageInput.value = '';
                    document.querySelector('.ck-editor__editable').innerHTML = '';
                    document.querySelector('#blog-image').nextElementSibling.textContent = '';
                })
                .catch(error => {
                    console.error('Error publishing blog:', error);
                    alert('Failed to publish blog. Please try again.');
                })
                .finally(() => {
                    // Reset button state
                    publishBlogBtn.disabled = false;
                    publishBlogBtn.textContent = 'Publish Blog';
                });
            };
        });
    }

    // Upload Video Button Handler
    const uploadVideoBtn = document.querySelector('.upload-btn');
    if (uploadVideoBtn) {
        console.log("Found upload video button, adding click listener");
        uploadVideoBtn.addEventListener('click', function() {
            console.log("Upload video button clicked!");
            
            const statusEl = document.getElementById('upload-status');
            
            // Clear any previous status
            statusEl.textContent = '';
            statusEl.className = '';
            
            // Get form values
            const titleInput = document.querySelector('#videos .form-group:nth-child(1) input');
            const categorySelect = document.querySelector('#videos .form-group:nth-child(2) select');
            const durationInput = document.querySelector('#videos .form-group:nth-child(3) input') || { value: 0 };
            const videoImageInput = document.getElementById('video-image');
            const videoFileInput = document.getElementById('video-file');
            const youtubeUrlInput = document.getElementById('youtube-url');
            
            // Determine which upload method is active
            const isYoutubeUpload = document.querySelector('.upload-tab-btn[data-tab="youtube-upload"]').classList.contains('active');
            
            // Validate common form fields
            if (!titleInput.value) {
                updateStatus('Please enter a video title', 'error');
                return;
            }
            
            if (categorySelect.selectedIndex === 0) {
                updateStatus('Please select a category', 'error');
                return;
            }
            
            if (!videoImageInput.files || videoImageInput.files.length === 0) {
                updateStatus('Please select a thumbnail image', 'error');
                return;
            }
            
            // Extract the duration in minutes
            const duration = parseInt(durationInput.value) || 0;
            if (duration <= 0) {
                updateStatus('Please enter a valid duration in minutes', 'error');
                return;
            }
            
            // Check which upload method we're using and validate accordingly
            if (isYoutubeUpload) {
                // YouTube URL validation
                const youtubeUrl = youtubeUrlInput.value.trim();
                if (!youtubeUrl || !(youtubeUrl.includes('youtube.com/') || youtubeUrl.includes('youtu.be/'))) {
                    updateStatus('Please enter a valid YouTube URL', 'error');
                    return;
                }
                
                const videoId = extractYoutubeId(youtubeUrl);
                if (!videoId) {
                    updateStatus('Could not extract video ID from the YouTube URL', 'error');
                    return;
                }
                
                // Format the URL to a standard format
                const formattedYoutubeUrl = `https://www.youtube.com/watch?v=${videoId}`;
                
                // Show loading state
                uploadVideoBtn.disabled = true;
                uploadVideoBtn.textContent = 'Uploading...';
                updateStatus('Processing thumbnail image...', 'progress');
                
                // Upload the thumbnail image
                const imageReader = new FileReader();
                imageReader.readAsDataURL(videoImageInput.files[0]);
                
                imageReader.onload = function() {
                    const base64Image = imageReader.result;
                    console.log("Image loaded successfully, size:", (base64Image.length / (1024 * 1024)).toFixed(2) + " MB");
                    
                    // Compress the image
                    compressImage(base64Image, function(compressedImage) {
                        updateStatus('Sending data to server...', 'progress');
                        
                        // Send to server
                        fetch('/api/workouts', {
                            method: 'POST',
                            headers: {
                                'Content-Type': 'application/json',
                            },
                            credentials: 'include',
                            body: JSON.stringify({
                                title: titleInput.value,
                                category: categorySelect.value,
                                duration: duration,
                                featuredImage: compressedImage,
                                videoUrl: formattedYoutubeUrl
                            }),
                        })
                        .then(handleResponse)
                        .then(handleSuccess)
                        .catch(handleError)
                        .finally(resetButton);
                    });
                };
            } else {
                // File upload validation
                if (!videoFileInput.files || videoFileInput.files.length === 0) {
                    updateStatus('Please select a video file', 'error');
                    return;
                }
                
                // Check file size
                const videoFile = videoFileInput.files[0];
                const videoSizeMB = videoFile.size / (1024 * 1024);
                console.log(`Video file size: ${videoSizeMB.toFixed(2)} MB`);
                
                if (videoSizeMB > 45) {
                    updateStatus(`The video file is too large (${videoSizeMB.toFixed(2)} MB). Please use a smaller video file or use the YouTube URL option.`, 'error');
                    return;
                }
                
                // Show loading state
                uploadVideoBtn.disabled = true;
                uploadVideoBtn.textContent = 'Uploading...';
                updateStatus('Preparing files for upload...', 'progress');
                
                // Process the thumbnail image
                const imageReader = new FileReader();
                imageReader.readAsDataURL(videoImageInput.files[0]);
                
                imageReader.onload = function() {
                    const base64Image = imageReader.result;
                    console.log("Image loaded successfully, size:", (base64Image.length / (1024 * 1024)).toFixed(2) + " MB");
                    updateStatus('Processing thumbnail image...', 'progress');
                    
                    // Compress the image
                    compressImage(base64Image, function(compressedImage) {
                        updateStatus('Processing video file...', 'progress');
                        
                        // Process the video file
                        const videoReader = new FileReader();
                        videoReader.readAsDataURL(videoFileInput.files[0]);
                        
                        videoReader.onload = function() {
                            const base64Video = videoReader.result;
                            console.log("Video loaded successfully, size:", (base64Video.length / (1024 * 1024)).toFixed(2) + " MB");
                            
                            // Check if the combined size is too large
                            const totalSizeMB = (base64Video.length + compressedImage.length) / (1024 * 1024);
                            console.log(`Total payload size: ${totalSizeMB.toFixed(2)} MB`);
                            
                            if (totalSizeMB > 49) {
                                updateStatus(`The combined data size (${totalSizeMB.toFixed(2)} MB) exceeds our limit (50 MB). Please use a smaller video file or try the YouTube URL option.`, 'error');
                                uploadVideoBtn.disabled = false;
                                uploadVideoBtn.textContent = 'Upload Video';
                                return;
                            }
                            
                            // Send to server
                            updateStatus('Uploading to server...', 'progress');
                            console.log("Sending video upload request to server...");
                            fetch('/api/workouts', {
                                method: 'POST',
                                headers: {
                                    'Content-Type': 'application/json',
                                },
                                credentials: 'include',
                                body: JSON.stringify({
                                    title: titleInput.value,
                                    category: categorySelect.value,
                                    duration: duration,
                                    featuredImage: compressedImage,
                                    videoUrl: base64Video
                                }),
                            })
                            .then(handleResponse)
                            .then(handleSuccess)
                            .catch(handleError)
                            .finally(resetButton);
                        };
                        
                        videoReader.onerror = function() {
                            console.error('Error reading video file:', videoReader.error);
                            updateStatus('Error reading video file. Please try again with a different file.', 'error');
                            uploadVideoBtn.disabled = false;
                            uploadVideoBtn.textContent = 'Upload Video';
                        };
                    });
                };
                
                imageReader.onerror = function() {
                    console.error('Error reading image file:', imageReader.error);
                    updateStatus('Error reading image file. Please try again with a different file.', 'error');
                    uploadVideoBtn.disabled = false;
                    uploadVideoBtn.textContent = 'Upload Video';
                };
            }
        });
    }

    // Response handler functions
    function handleResponse(response) {
        console.log("Server responded with status:", response.status);
        if (!response.ok) {
            return response.json().then(errorData => {
                console.error('Server error details:', errorData);
                throw new Error(`Failed to upload video: ${errorData.message || 'Unknown error'}`);
            }).catch(jsonError => {
                console.error('Error parsing error response:', jsonError);
                if (response.status === 413) {
                    throw new Error('Video file is too large. Please use a smaller file.');
                } else if (response.status === 401) {
                    throw new Error('You need to be logged in to upload videos.');
                } else {
                    throw new Error(`Failed to upload video: Status ${response.status}`);
                }
            });
        }
        return response.json();
    }

    function handleSuccess(data) {
        console.log("Video upload successful:", data);
        updateStatus('Video uploaded successfully!', 'success');
        alert('Video uploaded successfully!');
        
        // Reset all form fields
        resetForm();
    }

    function handleError(error) {
        console.error('Error uploading video:', error);
        updateStatus('Failed to upload video: ' + error.message, 'error');
        alert('Failed to upload video: ' + error.message);
    }

    function resetButton() {
        // Reset button state
        const uploadVideoBtn = document.querySelector('.upload-btn');
        uploadVideoBtn.disabled = false;
        uploadVideoBtn.textContent = 'Upload Video';
    }

    function resetForm() {
        // Reset form fields
        const titleInput = document.querySelector('#videos .form-group:nth-child(1) input');
        const categorySelect = document.querySelector('#videos .form-group:nth-child(2) select');
        const durationInput = document.querySelector('#videos .form-group:nth-child(3) input');
        const videoImageInput = document.getElementById('video-image');
        const videoFileInput = document.getElementById('video-file');
        const youtubeUrlInput = document.getElementById('youtube-url');
        
        if (titleInput) titleInput.value = '';
        if (categorySelect) categorySelect.selectedIndex = 0;
        if (durationInput) durationInput.value = '';
        if (videoImageInput) videoImageInput.value = '';
        if (videoFileInput) videoFileInput.value = '';
        if (youtubeUrlInput) youtubeUrlInput.value = '';
        
        // Clear file name displays
        document.querySelectorAll('.file-name-display').forEach(el => {
            el.textContent = '';
        });
        
        // Clear previews
        if (document.getElementById('video-preview')) {
            document.getElementById('video-preview').style.display = 'none';
            document.getElementById('video-preview').src = '';
        }
        
        if (document.getElementById('youtube-embed-container')) {
            document.getElementById('youtube-embed-container').innerHTML = '';
            document.querySelector('.youtube-preview').style.display = 'none';
        }
    }

    // Drag and Drop
    const dropZone = document.querySelector('.file-upload');

    if (dropZone) {
        ['dragenter', 'dragover', 'dragleave', 'drop'].forEach(eventName => {
            dropZone.addEventListener(eventName, preventDefaults, false);
        });

        function preventDefaults(e) {
            e.preventDefault();
            e.stopPropagation();
        }

        ['dragenter', 'dragover'].forEach(eventName => {
            dropZone.addEventListener(eventName, highlight, false);
        });

        ['dragleave', 'drop'].forEach(eventName => {
            dropZone.addEventListener(eventName, unhighlight, false);
        });

        function highlight(e) {
            dropZone.classList.add('highlight');
        }

        function unhighlight(e) {
            dropZone.classList.remove('highlight');
        }

        dropZone.addEventListener('drop', handleDrop, false);

        function handleDrop(e) {
            const dt = e.dataTransfer;
            const file = dt.files[0];

            if (file && file.type.startsWith('video/')) {
                videoInput.files = dt.files;
                const url = URL.createObjectURL(file);
                videoPreview.src = url;
                videoPreview.style.display = 'block';
                uploadLabel.textContent = file.name;
            }
        }
    }

    // Load Content Library
    loadContentLibrary();

    // Add event listeners for file inputs to show the file name
    document.getElementById('video-image')?.addEventListener('change', function(e) {
        const fileName = e.target.files[0]?.name || 'No file selected';
        this.nextElementSibling.textContent = fileName;
    });
    
    document.getElementById('video-file')?.addEventListener('change', function(e) {
        const fileName = e.target.files[0]?.name || 'No file selected';
        this.nextElementSibling.textContent = fileName;
        
        // Preview the video
        if (e.target.files && e.target.files[0]) {
            const videoPreview = document.getElementById('video-preview');
            videoPreview.src = URL.createObjectURL(e.target.files[0]);
            videoPreview.style.display = 'block';
        }
    });
});

function loadContentLibrary() {
    const contentGrid = document.querySelector('.content-grid');
    const sampleContent = [
        {
            type: 'video',
            title: 'Full Body HIIT',
            thumbnail: '/Assets/hiit.jpg',
            date: '2024-03-14',
            views: 1234
        },
        {
            type: 'blog',
            title: 'Nutrition Guidelines',
            thumbnail: '/Assets/nutrition.jpg',
            date: '2024-03-13',
            reads: 567
        }
        // Add more sample content
    ];

    contentGrid.innerHTML = sampleContent.map(content => `
        <div class="content-card">
            <div class="content-thumbnail">
                <img src="${content.thumbnail}" alt="${content.title}">
            </div>
            <div class="content-info">
                <h3 class="content-title">${content.title}</h3>
                <div class="content-meta">
                    <span>${content.type}</span> • 
                    <span>${content.date}</span> • 
                    <span>${content.type === 'video' ? content.views + ' views' : content.reads + ' reads'}</span>
                </div>
            </div>
        </div>
    `).join('');
}

document.getElementById('blog-image').addEventListener('change', function(e) {
    const fileName = e.target.files[0]?.name || 'No file selected';
    this.parentElement.querySelector('.file-name-display').textContent = fileName;
});

// Function to compress images (same as in the jQuery code)
function compressImage(base64Str, callback) {
    var img = new Image();
    img.src = base64Str;
    img.onload = function() {
        var canvas = document.createElement('canvas');
        var ctx = canvas.getContext('2d');
        
        // Calculate new dimensions while maintaining aspect ratio
        var maxWidth = 800;  // Reduce max width to decrease size further
        var maxHeight = 600; // Reduce max height
        var width = img.width;
        var height = img.height;
        
        if (width > height) {
            if (width > maxWidth) {
                height *= maxWidth / width;
                width = maxWidth;
            }
        } else {
            if (height > maxHeight) {
                width *= maxHeight / height;
                height = maxHeight;
            }
        }
        
        // Set canvas dimensions
        canvas.width = width;
        canvas.height = height;
        
        // Draw resized image to canvas
        ctx.drawImage(img, 0, 0, width, height);
        
        // Convert to compressed JPEG
        var compressedImage = canvas.toDataURL('image/jpeg', 0.6); // 0.6 = 60% quality for more compression
        
        callback(compressedImage);
    };
}

// Helper function to update status messages
function updateStatus(message, type) {
    const statusEl = document.getElementById('upload-status');
    if (!statusEl) return;
    
    statusEl.textContent = message;
    statusEl.className = type || '';
    
    // Scroll to status element to make sure user sees it
    statusEl.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
}