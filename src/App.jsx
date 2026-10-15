
import { useEffect, useState } from 'react'
import './App.css'

const defaultProfile = {
  name: 'John Doe',
  email: 'customer@example.com',
  mobile: '9876543210'
}

const defaultAddresses = [
  {
    id: 1,
    type: 'Home',
    recipient: 'John Doe',
    mobile: '9876543210',
    house: 'House No. 12',
    street: 'Main Street',
    city: 'Wardha',
    state: 'Maharashtra',
    postal: '442001',
    isDefault: true
  },
  {
    id: 2,
    type: 'Work',
    recipient: 'John Doe',
    mobile: '9876543210',
    house: 'Office No. 4',
    street: 'Business Road',
    city: 'Wardha',
    state: 'Maharashtra',
    postal: '442002',
    isDefault: false
  }
]

function loadSaved(key, fallback) {
  try {
    const saved = localStorage.getItem(key)
    return saved ? JSON.parse(saved) : fallback
  } catch {
    return fallback
  }
}

function EditProfile({ profile, onSave, onCancel }) {
  const [form, setForm] = useState({ ...profile })
  const [errors, setErrors] = useState({})

  function handleChange(e) {
    const { name, value } = e.target
    setForm(prev => ({ ...prev, [name]: value }))
    setErrors(prev => ({ ...prev, [name]: '' }))
  }

  function handleSubmit(e) {
    e.preventDefault()
    const nextErrors = {}

    if (form.name.trim().length < 2) {
      nextErrors.name = 'Name must contain at least 2 characters'
    }

    if (form.name.trim().length > 60) {
      nextErrors.name = 'Name cannot exceed 60 characters'
    }

    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email.trim())) {
      nextErrors.email = 'Enter a valid email address'
    }

    if (!/^[6-9]\d{9}$/.test(form.mobile)) {
      nextErrors.mobile = 'Enter a valid 10-digit Indian mobile number'
    }

    setErrors(nextErrors)
    if (Object.keys(nextErrors).length) return

    onSave({
      name: form.name.trim(),
      email: form.email.trim(),
      mobile: form.mobile
    })
  }

  return (
    <form className="edit-form" onSubmit={handleSubmit}>
      <h2>Edit Profile</h2>
      <p>Update your personal information.</p>

      <label htmlFor="profile-name">Full Name</label>
      <input
        id="profile-name"
        name="name"
        value={form.name}
        onChange={handleChange}
        maxLength={60}
        required
      />
      {errors.name && <small className="form-error">{errors.name}</small>}

      <label htmlFor="profile-email">Email Address</label>
      <input
        id="profile-email"
        name="email"
        type="email"
        value={form.email}
        onChange={handleChange}
        required
      />
      {errors.email && <small className="form-error">{errors.email}</small>}

      <label htmlFor="profile-mobile">Mobile Number</label>
      <input
        id="profile-mobile"
        name="mobile"
        value={form.mobile}
        onChange={handleChange}
        inputMode="numeric"
        maxLength={10}
        required
      />
      {errors.mobile && <small className="form-error">{errors.mobile}</small>}

      <div className="form-actions">
        <button type="button" className="outline-btn" onClick={onCancel}>
          Cancel
        </button>
        <button type="submit" className="primary-btn">
          Save Changes
        </button>
      </div>
    </form>
  )
}

function ProfilePhoto({ photo, onChange }) {
  const [error, setError] = useState('')

  function handleUpload(e) {
    const file = e.target.files?.[0]
    if (!file) return

    const allowedTypes = ['image/jpeg', 'image/png', 'image/webp']

    if (!allowedTypes.includes(file.type)) {
      setError('Only JPG, PNG and WEBP images are allowed.')
      e.target.value = ''
      return
    }

    if (file.size > 2 * 1024 * 1024) {
      setError('Image size must be less than 2 MB.')
      e.target.value = ''
      return
    }

    const reader = new FileReader()

    reader.onload = () => {
      const image = new Image()

      image.onload = () => {
        if (image.width < 100 || image.height < 100) {
          setError('Image must be at least 100 × 100 pixels.')
          return
        }

        onChange(reader.result)
        setError('')
      }

      image.onerror = () => setError('Unable to read this image.')
      image.src = reader.result
    }

    reader.onerror = () => setError('Image upload failed.')
    reader.readAsDataURL(file)
    e.target.value = ''
  }

  return (
    <div className="photo-section">
      <div className="photo-preview">
        {photo ? (
          <img src={photo} alt="Profile preview" />
        ) : (
          <span>JD</span>
        )}
      </div>

      <div className="photo-controls">
        <h3>Profile Photo</h3>
        <p>JPG, PNG or WEBP. Maximum size: 2 MB.</p>

        <label className="primary-btn upload-label">
          Upload Photo
          <input
            type="file"
            accept="image/jpeg,image/png,image/webp"
            onChange={handleUpload}
            hidden
          />
        </label>

        {photo && (
          <button
            type="button"
            className="outline-btn"
            onClick={() => {
              onChange('')
              setError('')
            }}
          >
            Remove Photo
          </button>
        )}

        {error && <p className="form-error">{error}</p>}
      </div>
    </div>
  )
}

function AddressManager() {
  const [addresses, setAddresses] = useState(() =>
    loadSaved('customer-addresses', defaultAddresses)
  )

  const [form, setForm] = useState({
    type: 'Home',
    recipient: '',
    mobile: '',
    house: '',
    street: '',
    city: '',
    state: '',
    postal: '',
    isDefault: false
  })

  const [errors, setErrors] = useState({})
  const [showForm, setShowForm] = useState(false)
  const [editingId, setEditingId] = useState(null)
  const [deleteId, setDeleteId] = useState(null)
  const [notice, setNotice] = useState('')

  useEffect(() => {
    try {
      localStorage.setItem('customer-addresses', JSON.stringify(addresses))
    } catch {
      setNotice('Unable to save addresses in browser storage.')
    }
  }, [addresses])

  function startAdd() {
    setForm({
      type: 'Home',
      recipient: '',
      mobile: '',
      house: '',
      street: '',
      city: '',
      state: '',
      postal: '',
      isDefault: addresses.length === 0
    })
    setErrors({})
    setEditingId(null)
    setShowForm(true)
    setNotice('')
  }

  function startEdit(address) {
    setForm({ ...address })
    setErrors({})
    setEditingId(address.id)
    setShowForm(true)
    setNotice('')
  }

  function handleChange(e) {
    const { name, value, checked, type } = e.target

    setForm(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }))

    setErrors(prev => ({ ...prev, [name]: '' }))
  }

  function saveAddress(e) {
    e.preventDefault()
    const nextErrors = {}

    if (!form.recipient.trim()) {
      nextErrors.recipient = 'Recipient name is required'
    }

    if (!/^[6-9]\d{9}$/.test(form.mobile)) {
      nextErrors.mobile = 'Enter a valid 10-digit mobile number'
    }

    if (!form.house.trim()) nextErrors.house = 'House details are required'
    if (!form.street.trim()) nextErrors.street = 'Street is required'
    if (!form.city.trim()) nextErrors.city = 'City is required'
    if (!form.state.trim()) nextErrors.state = 'State is required'

    if (!/^\d{6}$/.test(form.postal)) {
      nextErrors.postal = 'Enter a valid 6-digit postal code'
    }

    setErrors(nextErrors)
    if (Object.keys(nextErrors).length) return

    const id = editingId ?? Date.now()
    const savedAddress = { ...form, id }

    setAddresses(prev => {
      let updated = editingId === null
        ? [...prev, savedAddress]
        : prev.map(item => item.id === editingId ? savedAddress : item)

      if (form.isDefault || updated.length === 1) {
        updated = updated.map(item => ({
          ...item,
          isDefault: item.id === id
        }))
      }

      return updated
    })

    setNotice(editingId === null
      ? 'Address added successfully.'
      : 'Address updated successfully.')

    setShowForm(false)
    setEditingId(null)
  }

  function setDefault(id) {
    setAddresses(prev => prev.map(item => ({
      ...item,
      isDefault: item.id === id
    })))
    setNotice('Default address updated.')
  }

  function confirmDelete() {
    const target = addresses.find(item => item.id === deleteId)
    if (!target) return

    if (target.isDefault && addresses.length > 1) {
      setNotice('Set another address as default before deleting this one.')
      setDeleteId(null)
      return
    }

    setAddresses(prev => {
      const remaining = prev.filter(item => item.id !== deleteId)

      if (remaining.length && !remaining.some(item => item.isDefault)) {
        remaining[0] = { ...remaining[0], isDefault: true }
      }

      return remaining
    })

    setDeleteId(null)
    setNotice('Address deleted successfully.')
  }

  return (
    <section className="panel" id="addresses">
      <div className="section-heading">
        <div>
          <h2>Saved Addresses</h2>
          <p>Manage your delivery locations</p>
        </div>
        <button className="primary-btn" onClick={startAdd}>
          + Add Address
        </button>
      </div>

      {notice && <p className="address-notice" role="status">{notice}</p>}

      {showForm && (
        <form className="address-form" onSubmit={saveAddress}>
          <h3>{editingId === null ? 'Add New Address' : 'Edit Address'}</h3>

          <label htmlFor="address-type">Address Type</label>
          <select
            id="address-type"
            name="type"
            value={form.type}
            onChange={handleChange}
          >
            <option>Home</option>
            <option>Work</option>
            <option>Other</option>
          </select>

          {[
            ['recipient', 'Recipient Name'],
            ['mobile', 'Mobile Number'],
            ['house', 'House / Building'],
            ['street', 'Street / Locality'],
            ['city', 'City'],
            ['state', 'State'],
            ['postal', 'Postal Code']
          ].map(([name, label]) => (
            <div className="address-field" key={name}>
              <label htmlFor={`address-${name}`}>{label}</label>
              <input
                id={`address-${name}`}
                name={name}
                value={form[name]}
                onChange={handleChange}
                maxLength={name === 'mobile' || name === 'postal' ? 10 : 100}
                required
              />
              {errors[name] && (
                <small className="form-error">{errors[name]}</small>
              )}
            </div>
          ))}

          <label className="default-option">
            <input
              type="checkbox"
              name="isDefault"
              checked={form.isDefault}
              onChange={handleChange}
            />
            Set as default address
          </label>

          <div className="form-actions">
            <button
              type="button"
              className="outline-btn"
              onClick={() => setShowForm(false)}
            >
              Cancel
            </button>
            <button type="submit" className="primary-btn">
              Save Address
            </button>
          </div>
        </form>
      )}

      {addresses.length === 0 && !showForm && (
        <div className="empty-address">
          <h3>No saved addresses</h3>
          <p>Add an address for your deliveries.</p>
          <button className="primary-btn" onClick={startAdd}>
            Add Your First Address
          </button>
        </div>
      )}

      <div className="address-grid">
        {addresses.map(address => (
          <article className="address-card" key={address.id}>
            <div className="address-top">
              <span className="address-icon">⌂</span>
              {address.isDefault && (
                <span className="default-badge">DEFAULT</span>
              )}
            </div>

            <h3>{address.type}</h3>
            <p>{address.recipient}</p>
            <p>{address.house}, {address.street}</p>
            <p>{address.city}, {address.state} - {address.postal}</p>
            <p>Mobile: +91 {address.mobile}</p>

            <div className="address-actions">
              <button onClick={() => startEdit(address)}>Edit</button>
              <button onClick={() => setDeleteId(address.id)}>Delete</button>
              {!address.isDefault && (
                <button onClick={() => setDefault(address.id)}>
                  Set Default
                </button>
              )}
            </div>
          </article>
        ))}
      </div>

      {deleteId !== null && (
        <div className="modal-backdrop">
          <div className="confirm-modal" role="dialog" aria-modal="true">
            <h3>Delete Address?</h3>
            <p>Are you sure you want to delete this saved address?</p>
            <div className="form-actions">
              <button
                className="outline-btn"
                onClick={() => setDeleteId(null)}
              >
                Cancel
              </button>
              <button className="delete-btn" onClick={confirmDelete}>
                Confirm Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </section>
  )
}

function App() {
  const [profile, setProfile] = useState(() =>
    loadSaved('customer-profile', defaultProfile)
  )

  const [photo, setPhoto] = useState(() =>
    loadSaved('customer-photo', '')
  )

  const [isEditing, setIsEditing] = useState(false)

  useEffect(() => {
    try {
      localStorage.setItem('customer-profile', JSON.stringify(profile))
    } catch {
      console.error('Unable to save profile.')
    }
  }, [profile])

  useEffect(() => {
    try {
      if (photo) {
        localStorage.setItem('customer-photo', photo)
      } else {
        localStorage.removeItem('customer-photo')
      }
    } catch {
      console.error('Photo could not be saved. The browser storage may be full.')
    }
  }, [photo])

  const initials = profile.name
    .split(' ')
    .map(part => part[0])
    .join('')
    .slice(0, 2)
    .toUpperCase()

  const percentage = Math.round(
    ([profile.name, profile.email, profile.mobile].filter(
      value => value.trim()
    ).length / 3) * 100
  )

  return (
    <div className="app">
      <aside className="sidebar">
        <h2 className="logo">MyProfile.</h2>
        <p className="menu-label">MENU</p>

        <nav>
          <a className="nav-link active" href="#profile">◉ My Profile</a>
          <a className="nav-link" href="#addresses">⌖ My Addresses</a>
          <a className="nav-link" href="#settings">⚙ Account Settings</a>
        </nav>

        <div className="sidebar-bottom">
          <div className="mini-avatar">
            {photo ? <img src={photo} alt="Profile" /> : initials}
          </div>
          <div>
            <strong>{profile.name}</strong>
            <p>Customer Account</p>
          </div>
        </div>
      </aside>

      <main className="main-content">
        <header className="topbar">
          <div>
            <p className="eyebrow">ACCOUNT / PROFILE</p>
            <h1>My Profile</h1>
          </div>
          <button className="outline-btn" type="button">
            View Account
          </button>
        </header>

        <section className="welcome">
          <div>
            <p className="eyebrow light">YOUR ACCOUNT</p>
            <h2>Manage your profile</h2>
            <p>Keep your personal information and addresses up to date.</p>
          </div>
          <div className="welcome-icon">✦</div>
        </section>

        <section className="stats">
          <article className="stat-card">
            <p>Profile Completion</p>
            <h2>{percentage}%</h2>
            <div className="progress">
              <div className="progress-fill" style={{ width: `${percentage}%` }} />
            </div>
            <small>Based on required profile fields</small>
          </article>

          <article className="stat-card">
            <p>Saved Addresses</p>
            <h2>Manage below</h2>
            <small>Your delivery locations</small>
          </article>

          <article className="stat-card">
            <p>Account Status</p>
            <h2 className="verified">Active</h2>
            <small>Sample account status</small>
          </article>
        </section>

        <section className="panel" id="profile">
          {isEditing ? (
            <EditProfile
              profile={profile}
              onSave={updated => {
                setProfile(updated)
                setIsEditing(false)
              }}
              onCancel={() => setIsEditing(false)}
            />
          ) : (
            <>
              <div className="section-heading">
                <div>
                  <h2>Personal Information</h2>
                  <p>Your registered customer details</p>
                </div>
                <button
                  className="primary-btn"
                  onClick={() => setIsEditing(true)}
                >
                  Edit Profile
                </button>
              </div>

              <ProfilePhoto photo={photo} onChange={setPhoto} />

              <div className="profile-details">
                <div className="profile-avatar">
                  {photo ? <img src={photo} alt="Profile" /> : initials}
                </div>

                <div className="detail-grid">
                  <div>
                    <label>Full Name</label>
                    <strong>{profile.name}</strong>
                  </div>
                  <div>
                    <label>Email Address</label>
                    <strong>{profile.email}</strong>
                    <small className="status">Unverified</small>
                  </div>
                  <div>
                    <label>Mobile Number</label>
                    <strong>+91 {profile.mobile}</strong>
                    <small className="status">Unverified</small>
                  </div>
                  <div>
                    <label>Member Since</label>
                    <strong>Sample account</strong>
                  </div>
                </div>
              </div>
            </>
          )}
        </section>

        <AddressManager />

        <section className="panel" id="settings">
          <h2>Account Settings</h2>
          <p>Account security and preferences will be available here.</p>
        </section>

        <footer>Customer Profile Management · CUS-04</footer>
      </main>
    </div>
  )
}

export default App
