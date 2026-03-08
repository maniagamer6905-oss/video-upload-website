function deleteVideo(filename) {
    if (confirm('Delete this video?')) {
        fetch('/admin/delete/' + filename, { method: 'DELETE' })
        .then(function(r) { return r.json(); })
        .then(function(d) { alert(d.message); location.reload(); });
    }
}