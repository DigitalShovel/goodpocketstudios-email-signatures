let previousCopyButton = null;

document.querySelectorAll('.btn__select').forEach(buttonSelect => {
    buttonSelect.addEventListener('click', function(event) {
        event.stopPropagation(); // Prevent the document click event from firing

        // If there was a previous selection, disable its copy button
        if (previousCopyButton) {
            previousCopyButton.setAttribute('disabled', 'disabled');
        }

        const signatureContainer = this.parentElement.parentElement;
        if (signatureContainer && signatureContainer.classList.contains('signature-container')) {
            const signature = signatureContainer.querySelector('.signature');
            if (signature) {
                const range = document.createRange();
                range.selectNode(signature);
                window.getSelection().removeAllRanges(); // Clear previous selection
                window.getSelection().addRange(range);

                const copyButton = this.parentElement.querySelector('.btn__copy');
                if (copyButton) {
                    copyButton.removeAttribute('disabled');
                    previousCopyButton = copyButton; // Keep track of the current copy button
                }
            }
        }
    });
});

document.querySelectorAll('.btn__copy').forEach(buttonCopy => {
    buttonCopy.addEventListener('click', function(event) {
        event.stopPropagation(); // Prevent the document click event from firing
        document.execCommand('copy');
        window.getSelection().removeAllRanges();
        alert('Successfully copied selection to clipboard! You can now paste it into your email signature.');
    });
});

// Add a click event listener to the document
document.addEventListener('click', function() {
    if (previousCopyButton) {
        previousCopyButton.setAttribute('disabled', 'disabled');
        window.getSelection().removeAllRanges();
    }
});