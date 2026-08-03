import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { BsFillHouseFill } from "react-icons/bs";
import { PiBuildingApartmentFill } from "react-icons/pi";
import { FaMapLocationDot } from "react-icons/fa6";
import { API_URL } from '../../services/api';
import './Properties.css';

const BrowseProperties = ({ currentLocation = 'bahriatown' }) => {
    const navigate = useNavigate();
    const [activeTabs, setActiveTabs] = useState({
        homes: 'popular',
        plots: 'popular',
        commercial: 'popular'
    });
    const [blockOptions, setBlockOptions] = useState([]);
    const [loading, setLoading] = useState(true);

    const propertyTypeByCategory = {
        homes: 'House',
        plots: 'Plot',
        commercial: 'Commercial'
    };

    // Fetch blocks dynamically from backend
    useEffect(() => {
        const fetchBlocks = async () => {
            setLoading(true);
            try {
                const response = await fetch(
                    `${API_URL}/api/filters/?location=${currentLocation}`
                );

                if (response.ok) {
                    const data = await response.json();
                    // Remove 'All' from blockOptions
                    const blocks = data.blockOptions.filter(b => b !== 'All');

                    // If no blocks or only 'All', use fallback
                    if (blocks.length === 0) {
                        setBlockOptions(getFallbackBlocks(currentLocation));
                    } else {
                        setBlockOptions(blocks);
                    }
                } else {
                    setBlockOptions(getFallbackBlocks(currentLocation));
                }
            } catch (err) {
                console.error('Error fetching blocks:', err);
                // Use fallback blocks if API fails
                setBlockOptions(getFallbackBlocks(currentLocation));
            } finally {
                setLoading(false);
            }
        };

        fetchBlocks();
    }, [currentLocation]);

    // Fallback blocks in case API is not available
    const getFallbackBlocks = (location) => {
        const fallbackData = {
            bahriatown: ['Safari Villas', 'Rafi Block', 'Johar Block', 'Tauheed Block', 'Shershah Block', 'Nishtar Block'],
            dharaya: ['Phase 1', 'Phase 2', 'Phase 3', 'Phase 4', 'Phase 5', 'Phase 6'],
            etihadtown: ['Block A', 'Block B', 'Block C', 'Block D', 'Block E', 'Block F'],
            uniontown: ['Green Block', 'Blue Block', 'Red Block', 'Yellow Block', 'Orange Block', 'White Block']
        };
        return fallbackData[location] || [];
    };

    // Generate blocks for each property type from API data
    const generateBlocksForType = (blocks, propertyType) => {
        const subtitles = {
            homes: ['Premium Homes', 'Modern Living', 'Compact Homes', 'Family Homes', 'Luxury Homes', 'Cozy Homes'],
            plots: ['Residential Plots', 'Investment Zone', 'Prime Location', 'Ready to Build', 'Hot Zone', 'Future Ready'],
            commercial: ['Commercial Hub', 'Business Center', 'Prime Shops', 'Retail Spaces', 'Mixed Use', 'Professional Space']
        };

        // Add specific "All" option based on property type
        const allLabels = {
            homes: 'All Houses',
            plots: 'All Plots',
            commercial: 'All Commercial'
        };

        const allBlocksOption = { label: allLabels[propertyType], subtitle: 'View All', link: true };

        const blockItems = blocks.slice(0, 5).map((block, index) => ({
            label: block,
            subtitle: subtitles[propertyType][index % subtitles[propertyType].length],
            link: true
        }));

        return [allBlocksOption, ...blockItems];
    };

    // Location-specific sizes
    const sizesByLocation = {
        bahriatown: {
            homes: [
                { label: '2 Marla', subtitle: 'Houses', link: true },
                { label: '3 Marla', subtitle: 'Houses', link: true },
                { label: '5 Marla', subtitle: 'Houses', link: true },
                { label: '10 Marla', subtitle: 'Houses', link: true },
                { label: '1 Kanal', subtitle: 'Houses', link: true },
                { label: '2 Kanal', subtitle: 'Houses', link: true },
                { label: '3 Kanal', subtitle: 'Houses', link: true },
                { label: '4 Kanal', subtitle: 'Houses', link: true },
                { label: '5 Kanal', subtitle: 'Houses', link: true }
            ],
            plots: [
                { label: '2 Marla', subtitle: 'Plots', link: true },
                { label: '3 Marla', subtitle: 'Plots', link: true },
                { label: '5 Marla', subtitle: 'Plots', link: true },
                { label: '10 Marla', subtitle: 'Plots', link: true },
                { label: '1 Kanal', subtitle: 'Plots', link: true },
                { label: '2 Kanal', subtitle: 'Plots', link: true },
                { label: '3 Kanal', subtitle: 'Plots', link: true },
                { label: '4 Kanal', subtitle: 'Plots', link: true },
                { label: '5 Kanal', subtitle: 'Plots', link: true }
            ],
            commercial: [
                { label: 'Offices', subtitle: 'Professional Spaces', link: true },
                { label: 'Retail Shops', subtitle: 'Street Level', link: true },
                { label: 'Restaurants', subtitle: 'Food Business', link: true },
                { label: 'Warehouses', subtitle: 'Bulk Storage', link: true },
                { label: 'Medical Clinics', subtitle: 'Health Services', link: true },
                { label: 'Banks/ATM', subtitle: 'Financial Services', link: true }
            ]
        },
        dharaya: {
            homes: [
                { label: '5 Marla', subtitle: 'Houses', link: true },
                { label: '10 Marla', subtitle: 'Houses', link: true },
                { label: '1 Kanal', subtitle: 'Houses', link: true },
                { label: '2 Kanal', subtitle: 'Houses', link: true },
                { label: '4 Kanal', subtitle: 'Houses', link: true },
                { label: '8 Kanal', subtitle: 'Houses', link: true }
            ],
            plots: [
                { label: '5 Marla', subtitle: 'Plots', link: true },
                { label: '10 Marla', subtitle: 'Plots', link: true },
                { label: '1 Kanal', subtitle: 'Plots', link: true },
                { label: '2 Kanal', subtitle: 'Plots', link: true },
                { label: '4 Kanal', subtitle: 'Plots', link: true },
                { label: '8 Kanal', subtitle: 'Plots', link: true }
            ],
            commercial: [
                { label: 'Small Office', subtitle: '500-1000 Sq Ft', link: true },
                { label: 'Large Office', subtitle: '2000+ Sq Ft', link: true },
                { label: 'Retail Shop', subtitle: '1000-2000 Sq Ft', link: true },
                { label: 'Plaza', subtitle: 'Full Building', link: true },
                { label: 'Showroom', subtitle: '3000+ Sq Ft', link: true },
                { label: 'Warehouse', subtitle: '5000+ Sq Ft', link: true }
            ]
        },
        etihadtown: {
            homes: [
                { label: '3 Marla', subtitle: 'Houses', link: true },
                { label: '5 Marla', subtitle: 'Houses', link: true },
                { label: '7 Marla', subtitle: 'Houses', link: true },
                { label: '10 Marla', subtitle: 'Houses', link: true },
                { label: '1 Kanal', subtitle: 'Houses', link: true },
                { label: '2 Kanal', subtitle: 'Houses', link: true }
            ],
            plots: [
                { label: '3 Marla', subtitle: 'Plots', link: true },
                { label: '5 Marla', subtitle: 'Plots', link: true },
                { label: '7 Marla', subtitle: 'Plots', link: true },
                { label: '10 Marla', subtitle: 'Plots', link: true },
                { label: '1 Kanal', subtitle: 'Plots', link: true },
                { label: '2 Kanal', subtitle: 'Plots', link: true }
            ],
            commercial: [
                { label: 'Shop', subtitle: '200-500 Sq Ft', link: true },
                { label: 'Office', subtitle: '500-1500 Sq Ft', link: true },
                { label: 'Restaurant', subtitle: '1000-2000 Sq Ft', link: true },
                { label: 'Showroom', subtitle: '2000+ Sq Ft', link: true },
                { label: 'Plaza Unit', subtitle: 'Various Sizes', link: true },
                { label: 'Warehouse', subtitle: '3000+ Sq Ft', link: true }
            ]
        },
        uniontown: {
            homes: [
                { label: '2 Marla', subtitle: 'Houses', link: true },
                { label: '3 Marla', subtitle: 'Houses', link: true },
                { label: '5 Marla', subtitle: 'Houses', link: true },
                { label: '10 Marla', subtitle: 'Houses', link: true },
                { label: '1 Kanal', subtitle: 'Houses', link: true }
            ],
            plots: [
                { label: '2 Marla', subtitle: 'Plots', link: true },
                { label: '3 Marla', subtitle: 'Plots', link: true },
                { label: '5 Marla', subtitle: 'Plots', link: true },
                { label: '10 Marla', subtitle: 'Plots', link: true },
                { label: '1 Kanal', subtitle: 'Plots', link: true }
            ],
            commercial: [
                { label: 'Small Shop', subtitle: '200-400 Sq Ft', link: true },
                { label: 'Medium Shop', subtitle: '500-1000 Sq Ft', link: true },
                { label: 'Office Space', subtitle: '800-1500 Sq Ft', link: true },
                { label: 'Restaurant', subtitle: '1000-2000 Sq Ft', link: true },
                { label: 'Clinic', subtitle: '500-1000 Sq Ft', link: true },
                { label: 'Warehouse', subtitle: '2000+ Sq Ft', link: true }
            ]
        }
    };

    // Get current blocks and sizes
    const currentBlocks = {
        homes: blockOptions.length > 0 ? generateBlocksForType(blockOptions, 'homes') : [],
        plots: blockOptions.length > 0 ? generateBlocksForType(blockOptions, 'plots') : [],
        commercial: blockOptions.length > 0 ? generateBlocksForType(blockOptions, 'commercial') : []
    };
    const currentSizes = sizesByLocation[currentLocation] || sizesByLocation.bahriatown;

    const categories = {
        homes: {
            name: 'Houses',
            icon: BsFillHouseFill,
            tabs: {
                popular: currentBlocks.homes,
                size: currentSizes.homes,
                // areaSize: [
                //     { label: '500 Sq Ft', subtitle: 'Small', link: true },
                //     { label: '1000 Sq Ft', subtitle: 'Medium', link: true },
                //     { label: '2000 Sq Ft', subtitle: 'Large', link: true },
                //     { label: '3000 Sq Ft', subtitle: 'Extra Large', link: true },
                //     { label: '4000+ Sq Ft', subtitle: 'Huge Estates', link: true },
                //     { label: 'Custom Sizes', subtitle: 'Any Size', link: true }
                // ]
            }
        },
        plots: {
            name: 'Plots',
            icon: FaMapLocationDot,
            tabs: {
                popular: currentBlocks.plots,
                size: currentSizes.plots,
                // areaSize: [
                //     { label: '250 Sq Yd', subtitle: 'Small', link: true },
                //     { label: '500 Sq Yd', subtitle: 'Medium', link: true },
                //     { label: '1000 Sq Yd', subtitle: 'Large', link: true },
                //     { label: '1 Kanal', subtitle: 'Premium', link: true },
                //     { label: '2 Kanal', subtitle: 'Extra Large', link: true },
                //     { label: 'Custom Sizes', subtitle: 'Any Dimension', link: true }
                // ]
            }
        },
        commercial: {
            name: 'Commercial',
            icon: PiBuildingApartmentFill,
            tabs: {
                popular: currentBlocks.commercial,
                size: currentSizes.commercial,
                // areaSize: [
                //     { label: '500 Sq Ft', subtitle: 'Startup Size', link: true },
                //     { label: '1000 Sq Ft', subtitle: 'Standard Office', link: true },
                //     { label: '2000 Sq Ft', subtitle: 'Large Office', link: true },
                //     { label: '5000 Sq Ft', subtitle: 'Big Warehouse', link: true },
                //     { label: '10000 Sq Ft', subtitle: 'Industrial', link: true },
                //     { label: 'Custom Sizes', subtitle: 'Any Requirement', link: true }
                // ]
            }
        }
    };

    const handleTabChange = (categoryKey, tabKey) => {
        setActiveTabs(prev => ({
            ...prev,
            [categoryKey]: tabKey
        }));
    };

    const handleItemClick = (item, tabKey, categoryKey) => {
        const propertyType = propertyTypeByCategory[categoryKey] || 'All';

        if (tabKey === 'popular') {
            if (item.label === 'All Houses' || item.label === 'All Plots' || item.label === 'All Commercial') {
                // Navigate to listings with just the property type filter
                navigate('/listings', { state: { mode: 'all', propertyType, selected: item.label } });
            } else {
                navigate('/listings', { state: { mode: 'block', selected: item.label, propertyType } });
            }
        } else if (tabKey === 'size') {
            navigate('/listings', { state: { mode: 'size', selected: item.label, propertyType } });
        }
        // else if (tabKey === 'areaSize') {
        //     navigate('/listings', { state: { mode: 'size', selected: item.label, propertyType } });
        // }
    };

    const tabOrder = ['popular', 'size']; // 'areaSize' commented out

    return (
        <section className="browse-properties" id="properties">
            <div className="browse-container">
                <h2 className="browse-title">Properties</h2>

                {loading ? (
                    <div style={{ textAlign: 'center', padding: '40px' }}>
                        <p>Loading properties...</p>
                    </div>
                ) : (
                    <div className="category-cards">
                        {Object.entries(categories).map(([key, category]) => {
                            const Icon = category.icon;
                            const currentTab = activeTabs[key];
                            const currentItems = category.tabs[currentTab];

                            return (
                                <div key={key} className="category-card">
                                    <div className="category-icon">
                                        <Icon size={41} />
                                    </div>
                                    <h3 className="category-name">{category.name}</h3>

                                    <div className="tabs">
                                        {Object.keys(category.tabs).map((tabKey) => (
                                            <button
                                                key={tabKey}
                                                className={`tab-button ${currentTab === tabKey ? 'active' : ''}`}
                                                onClick={() => handleTabChange(key, tabKey)}
                                            >
                                                {tabKey === 'popular' && 'Popular'}
                                                {tabKey === 'size' && 'Size'}
                                                {/* {tabKey === 'areaSize' && 'Area Size'} */}
                                            </button>
                                        ))}
                                    </div>

                                    <div className="properties-grid">
                                        {currentItems && currentItems.length > 0 ? (
                                            currentItems.map((item, index) => (
                                                <div
                                                    key={index}
                                                    className="property-item"
                                                    onClick={() => handleItemClick(item, currentTab, key)}
                                                    style={{ cursor: (currentTab === 'popular' || currentTab === 'size') ? 'pointer' : 'default' }}
                                                >
                                                    <div className="property-content">
                                                        <h4 className="property-label">{item.label}</h4>
                                                        <p className="property-subtitle">{item.subtitle}</p>
                                                    </div>
                                                </div>
                                            ))
                                        ) : (
                                            <div style={{ padding: '20px', textAlign: 'center', gridColumn: '1 / -1' }}>
                                                <p>No properties available</p>
                                            </div>
                                        )}
                                    </div>

                                    <div className="carousel-dots" aria-label={`${category.name} tabs`}>
                                        {tabOrder.map((tabKey) => (
                                            <button
                                                key={tabKey}
                                                type="button"
                                                className={`dot ${currentTab === tabKey ? 'active' : ''}`}
                                                onClick={() => handleTabChange(key, tabKey)}
                                                aria-label={`Show ${tabKey === 'popular' ? 'Popular' : tabKey === 'size' ? 'Size' : 'Area Size'} tab`}
                                            />
                                        ))}
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                )}
            </div>
        </section>
    );
};

export default BrowseProperties;
