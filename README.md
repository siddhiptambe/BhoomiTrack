# \# 🌍 BhoomiTrack

# \### Real-Time National Land Acquisition \& Management System

# 

# BhoomiTrack is a GIS-based platform designed to streamline land acquisition and management through geospatial visualization, parcel-level analysis, and structured land information management.

# 

# The platform aims to improve transparency, simplify land acquisition workflows, and support informed decision-making through interactive maps and spatial data analysis.

# 

# \---

# 

# \## Key Features

# 

# \- \*\*Interactive GIS Map:\*\* Visualize geographical data and land parcels using an interactive map interface.

# \- \*\*Land Parcel Analysis:\*\* Identify and analyze land parcels affected by proposed infrastructure projects.

# \- \*\*Route-Based Analysis:\*\* Evaluate land parcels along proposed project routes using geospatial buffers.

# \- \*\*Spatial Data Processing:\*\* Perform spatial queries and geographical calculations using PostGIS.

# \- \*\*Parcel Identification:\*\* Retrieve and visualize relevant parcel information based on geographical boundaries.

# \- \*\*Role-Based Access:\*\* Provide access to relevant platform functionalities based on user roles.

# \- \*\*Centralized Data Management:\*\* Maintain structured project and geographical information.

# 

# \## GIS Capabilities

# 

# The GIS module provides geographical analysis capabilities to support land acquisition planning.

# 

# Key capabilities include:

# 

# \- Interactive visualization of project routes and land parcels.

# \- Buffer generation around proposed infrastructure routes.

# \- Identification of parcels intersecting with project boundaries.

# \- Calculation of affected land areas.

# \- Retrieval of parcel ownership and geographical information.

# \- Spatial data retrieval through Supabase RPC functions.

# 

# \## Technology Stack

# 

# | Component | Technology |

# |---|---|

# | Frontend | React.js |

# | Framework | TanStack Start |

# | Styling | Tailwind CSS |

# | Mapping | Leaflet.js |

# | Map Data | OpenStreetMap |

# | Backend / Database | Supabase |

# | Spatial Database | PostgreSQL + PostGIS |

# | Spatial Queries | PostGIS |

# | Version Control | Git \& GitHub |

# 

# \## System Architecture

# 

# The platform follows a modular architecture in which the frontend communicates with the Supabase backend to retrieve project and geographical information.

# 

# ```text

# &#x20;         User Interface

# &#x20;               |

# &#x20;               v

# &#x20;      React + TanStack Start

# &#x20;               |

# &#x20;               v

# &#x20;         GIS Module

# &#x20;               |

# &#x20;               v

# &#x20;          Leaflet.js

# &#x20;               |

# &#x20;               v

# &#x20;       Supabase Backend

# &#x20;               |

# &#x20;         PostgreSQL

# &#x20;               |

# &#x20;            PostGIS

# &#x20;               |

# &#x20;               v

# &#x20;      Spatial Data Analysis

# &#x20;               |

# &#x20;               v

# &#x20;      Land Parcel Results

# ```

# 

# \## Getting Started

# 

# \### Prerequisites

# 

# Ensure that the following are installed:

# 

# \- Node.js

# \- npm

# \- Git

# \- A Supabase project with the required database configuration

# 

# \### Installation

# 

# \*\*1. Clone the repository\*\*

# 

# ```bash

# git clone <repository-url>

# ```

# 

# \*\*2. Navigate to the project directory\*\*

# 

# ```bash

# cd BhoomiTrack

# ```

# 

# \*\*3. Install dependencies\*\*

# 

# ```bash

# npm install

# ```

# 

# \*\*4. Configure environment variables\*\*

# 

# Create a `.env` file in the project root and configure the required Supabase credentials.

# 

# ```env

# VITE\_SUPABASE\_URL=your\_supabase\_url

# VITE\_SUPABASE\_ANON\_KEY=your\_supabase\_anon\_key

# ```

# 

# Use the environment variable names expected by your actual Supabase client configuration.

# 

# \*\*5. Start the development server\*\*

# 

# ```bash

# npm run dev

# ```

# 

# Open the local development URL displayed in your terminal.

# 

# \## Geospatial Analysis Workflow

# 

# 1\. Retrieve project-specific geographical information.

# 2\. Visualize the proposed project route on the interactive map.

# 3\. Generate a geographical buffer around the route.

# 4\. Identify land parcels intersecting with the buffer.

# 5\. Perform spatial analysis to determine affected parcels and land areas.

# 6\. Display the resulting geographical information through the GIS interface.

# 

# \## Project Objective

# 

# BhoomiTrack aims to contribute towards a more structured, transparent, and technology-driven land acquisition process by integrating GIS technologies with centralized project information management.

# 

# By combining interactive geographical visualization and spatial database capabilities, the platform supports more efficient land parcel assessment and infrastructure planning.

# 

# \## Contributors

# 

# Developed as part of \*\*Smart India Hackathon (SIH)\*\* under problem statement:

# 

# \*\*SIH26016 – Real-Time National Land Acquisition \& Management System\*\*

# 

# \---

# 

# \## License

# 

# This project is developed for academic and hackathon purposes. Licensing and usage terms are subject to the repository owner's decision.

