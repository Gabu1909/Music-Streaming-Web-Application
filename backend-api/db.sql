CREATE TABLE Users (
    user_id SERIAL PRIMARY KEY,
    username VARCHAR(50) UNIQUE NOT NULL,
    email VARCHAR(100) UNIQUE NOT NULL,
    password_hash TEXT NOT NULL,
    avatar_url TEXT,
    role VARCHAR(20) DEFAULT 'user',  
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE Artists (
    artist_id SERIAL PRIMARY KEY,
    user_id INTEGER UNIQUE REFERENCES Users(user_id) ON DELETE SET NULL,
    name VARCHAR(100) NOT NULL,
    bio TEXT,
    avatar_url TEXT
);

CREATE TABLE Albums (
    album_id SERIAL PRIMARY KEY,
    title VARCHAR(100) NOT NULL,
    artist_id INTEGER REFERENCES Artists(artist_id) ON DELETE CASCADE,
    cover_url TEXT,
    release_date DATE
);

CREATE TABLE Songs (
    song_id SERIAL PRIMARY KEY,
    title VARCHAR(100) NOT NULL,
    artist_id INTEGER REFERENCES Artists(artist_id) ON DELETE CASCADE,
    album_id INTEGER REFERENCES Albums(album_id) ON DELETE CASCADE,
    audio_url TEXT NOT NULL,
    duration INTEGER,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE Playlists (
    playlist_id SERIAL PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    user_id INTEGER REFERENCES Users(user_id) ON DELETE CASCADE,
    is_public BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE PlaylistSongs (
    playlist_id INTEGER REFERENCES Playlists(playlist_id) ON DELETE CASCADE,
    song_id INTEGER REFERENCES Songs(song_id) ON DELETE CASCADE,
    added_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY (playlist_id, song_id)
);

CREATE TABLE Favorites (
    user_id INTEGER REFERENCES Users(user_id) ON DELETE CASCADE,
    song_id INTEGER REFERENCES Songs(song_id) ON DELETE CASCADE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY (user_id, song_id)
);

CREATE TABLE ListeningHistory (
    history_id SERIAL PRIMARY KEY,
    user_id INTEGER REFERENCES Users(user_id) ON DELETE CASCADE,
    song_id INTEGER REFERENCES Songs(song_id) ON DELETE SET NULL,
    listened_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE SongArtists (
    song_id INTEGER REFERENCES Songs(song_id) ON DELETE CASCADE,
    artist_id INTEGER REFERENCES Artists(artist_id) ON DELETE CASCADE,
    PRIMARY KEY (song_id, artist_id)
);
